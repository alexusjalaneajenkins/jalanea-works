'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Mail, Lock, Fingerprint } from 'lucide-react'

type AuthMethod = 'password' | 'passkey' | 'magiclink'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') ? 'Authentication failed. Please try again.' : null
  )
  const [message, setMessage] = useState<string | null>(null)
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
  const [supportsPasskeys, setSupportsPasskeys] = useState(false)

  useEffect(() => {
    setSupportsPasskeys(browserSupportsWebAuthn())
  }, [])

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Password login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasskeyLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Get authentication options
      const optionsRes = await fetch('/api/auth/passkey/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined }),
      })

      if (!optionsRes.ok) {
        const data = await optionsRes.json()
        throw new Error(data.error || 'Failed to get login options')
      }

      const options = await optionsRes.json()

      // Prompt user for passkey
      const credential = await startAuthentication({ optionsJSON: options })

      // Verify with server
      const verifyRes = await fetch('/api/auth/passkey/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })

      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        throw new Error(data.error || 'Login failed')
      }

      const result = await verifyRes.json()

      if (result.success && result.token) {
        // Exchange token for session
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.verifyOtp({
          token_hash: result.token,
          type: result.type,
        })

        if (sessionError) {
          throw new Error('Failed to create session')
        }

        router.push('/dashboard')
        router.refresh()
      } else {
        throw new Error('Login failed')
      }
    } catch (err) {
      console.error('Passkey login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMagicLinkLogin(e: React.FormEvent) {
    e.preventDefault()
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

      setMessage('Check your email for the login link!')
    } catch (err) {
      console.error('Magic link error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (authMethod === 'password') {
      handlePasswordLogin(e)
    } else if (authMethod === 'passkey') {
      handlePasskeyLogin(e)
    } else {
      handleMagicLinkLogin(e)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
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
            required={authMethod !== 'passkey'}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
          />
          {authMethod === 'passkey' && (
            <p className="text-xs text-gray-500 mt-1">
              Optional - leave empty to use any saved passkey
            </p>
          )}
        </div>

        {/* Password Field - Only for password auth */}
        {authMethod === 'password' && (
          <div className="mb-6">
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
                placeholder="Enter your password"
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
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                Forgot password?
              </Link>
            </div>
          </div>
        )}

        {/* Passkey Info */}
        {authMethod === 'passkey' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-medium text-amber-900 flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Passkey Authentication
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Use Face ID, Touch ID, or your device PIN to sign in instantly.
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
          disabled={isLoading || (authMethod !== 'passkey' && !email) || (authMethod === 'password' && !password)}
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {authMethod === 'password' && <Lock className="w-5 h-5" />}
              {authMethod === 'passkey' && <Fingerprint className="w-5 h-5" />}
              {authMethod === 'magiclink' && <Mail className="w-5 h-5" />}
              {authMethod === 'password' && 'Sign In'}
              {authMethod === 'passkey' && 'Sign In with Passkey'}
              {authMethod === 'magiclink' && 'Send Login Link'}
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-amber-600 hover:text-amber-700 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8" />
        <div className="h-12 bg-gray-200 rounded mb-4" />
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
