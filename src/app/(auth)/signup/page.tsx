'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [supportsPasskeys, setSupportsPasskeys] = useState(false)

  useEffect(() => {
    setSupportsPasskeys(browserSupportsWebAuthn())
  }, [])

  async function handlePasskeySignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Email is required')
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Get registration options
      const optionsRes = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!optionsRes.ok) {
        const data = await optionsRes.json()
        throw new Error(data.error || 'Failed to get registration options')
      }

      const options = await optionsRes.json()

      // Prompt user to create passkey
      const credential = await startRegistration({ optionsJSON: options })

      // Verify and store credential
      const verifyRes = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, email }),
      })

      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        throw new Error(data.error || 'Registration failed')
      }

      const result = await verifyRes.json()

      if (result.success) {
        if (result.needsLogin) {
          setMessage('Account created! Please log in with your passkey.')
          setTimeout(() => router.push('/login'), 2000)
        } else if (result.redirectUrl) {
          // Auto-login via magic link
          const supabase = createClient()
          const url = new URL(result.redirectUrl)
          const token_hash = url.searchParams.get('token_hash')
          const type = url.searchParams.get('type')

          if (token_hash && type) {
            const { error: sessionError } = await supabase.auth.verifyOtp({
              token_hash,
              type: type as 'magiclink',
            })

            if (!sessionError) {
              router.push('/dashboard')
              router.refresh()
              return
            }
          }

          router.push('/dashboard')
          router.refresh()
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err) {
      console.error('Passkey signup error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMagicLinkSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Email is required')
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send magic link')
      }

      setMessage('Check your email for the signup link!')
    } catch (err) {
      console.error('Magic link error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">Join Jalanea Works today</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {message}
        </div>
      )}

      <form onSubmit={showMagicLink ? handleMagicLinkSignup : handlePasskeySignup}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        {!showMagicLink && supportsPasskeys && (
          <>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                Passkey Authentication
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Use Face ID, Touch ID, or your device PIN. No password to remember!
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  Create Account with Passkey
                </>
              )}
            </button>
          </>
        )}

        {(showMagicLink || !supportsPasskeys) && (
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sign up with Email
              </>
            )}
          </button>
        )}
      </form>

      {supportsPasskeys && (
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMagicLink(!showMagicLink)}
            className="mt-4 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            {showMagicLink ? 'Use Passkey Instead' : 'Use Email Link Instead'}
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
