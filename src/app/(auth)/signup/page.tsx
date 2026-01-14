'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Mail, Lock, Fingerprint } from 'lucide-react'

type AuthMethod = 'password' | 'passkey' | 'magiclink'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
  const [supportsPasskeys, setSupportsPasskeys] = useState(false)

  useEffect(() => {
    setSupportsPasskeys(browserSupportsWebAuthn())
  }, [])

  async function handlePasswordSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      setMessage('Check your email to confirm your account!')
    } catch (err) {
      console.error('Password signup error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    if (authMethod === 'password') {
      handlePasswordSignup(e)
    } else if (authMethod === 'passkey') {
      handlePasskeySignup(e)
    } else {
      handleMagicLinkSignup(e)
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

      {/* Auth Method Selector */}
      <div className="mb-6">
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setAuthMethod('password')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'password'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            Password
          </button>
          {supportsPasskeys && (
            <button
              type="button"
              onClick={() => setAuthMethod('passkey')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                authMethod === 'passkey'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              Passkey
            </button>
          )}
          <button
            type="button"
            onClick={() => setAuthMethod('magiclink')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'magiclink'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email Link
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email Field - Always shown */}
        <div className="mb-4">
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Password Fields - Only for password auth */}
        {authMethod === 'password' && (
          <>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 8 characters"
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              />
            </div>
          </>
        )}

        {/* Passkey Info */}
        {authMethod === 'passkey' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-medium text-amber-900 flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Passkey Authentication
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Use Face ID, Touch ID, or your device PIN. No password to remember!
            </p>
          </div>
        )}

        {/* Magic Link Info */}
        {authMethod === 'magiclink' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Link
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              We&apos;ll send a secure link to your email. Click it to sign in instantly.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email || (authMethod === 'password' && (!password || !confirmPassword))}
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {authMethod === 'password' && <Lock className="w-5 h-5" />}
              {authMethod === 'passkey' && <Fingerprint className="w-5 h-5" />}
              {authMethod === 'magiclink' && <Mail className="w-5 h-5" />}
              {authMethod === 'password' && 'Create Account'}
              {authMethod === 'passkey' && 'Create Account with Passkey'}
              {authMethod === 'magiclink' && 'Send Sign Up Link'}
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
