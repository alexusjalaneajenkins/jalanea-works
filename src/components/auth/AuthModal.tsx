'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { startAuthentication, startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { createClient } from '@/lib/supabase/client'
import {
  Zap,
  ArrowRight,
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Fingerprint,
  Check
} from 'lucide-react'

type AuthMode = 'signin' | 'signup'
type AuthMethod = 'password' | 'passkey'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [supportsPasskeys, setSupportsPasskeys] = useState(false)

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setSupportsPasskeys(browserSupportsWebAuthn())
  }, [])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setError(null)
      setMessage(null)
    }
  }, [isOpen, initialMode])

  const authMethods = [
    { id: 'password' as const, label: 'Password', icon: <Lock size={16} /> },
    ...(supportsPasskeys ? [{ id: 'passkey' as const, label: 'Passkey', icon: <Fingerprint size={16} /> }] : []),
  ]

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null)
    setMessage(null)
  }

  // Google OAuth
  async function handleGoogleAuth() {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      console.error('Google auth error:', err)
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setIsLoading(false)
    }
  }

  // Password Sign In
  async function handlePasswordSignIn() {
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw new Error(signInError.message)

      onClose()
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Password login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Password Sign Up
  async function handlePasswordSignUp() {
    if (!email || !password || !fullName) {
      setError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw new Error(signUpError.message)

      onClose()
      router.push('/foundation')
      router.refresh()
    } catch (err) {
      console.error('Sign up error:', err)
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Passkey Sign In
  async function handlePasskeySignIn() {
    setIsLoading(true)
    setError(null)

    try {
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
      const credential = await startAuthentication({ optionsJSON: options })

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
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.verifyOtp({
          token_hash: result.token,
          type: result.type,
        })

        if (sessionError) throw new Error('Failed to create session')

        onClose()
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Passkey login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Passkey Sign Up
  async function handlePasskeySignUp() {
    if (!email) {
      setError('Email is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
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
      const credential = await startRegistration({ optionsJSON: options })

      const verifyRes = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, credential }),
      })

      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        throw new Error(data.error || 'Registration failed')
      }

      const result = await verifyRes.json()

      if (result.success && result.token) {
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.verifyOtp({
          token_hash: result.token,
          type: result.type,
        })

        if (sessionError) throw new Error('Failed to create session')

        onClose()
        router.push('/foundation')
        router.refresh()
      }
    } catch (err) {
      console.error('Passkey registration error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authMethod === 'password') {
      if (mode === 'signin') {
        handlePasswordSignIn()
      } else {
        handlePasswordSignUp()
      }
    } else {
      if (mode === 'signin') {
        handlePasskeySignIn()
      } else {
        handlePasskeySignUp()
      }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#0f172a] border border-[#1e293b] rounded-3xl shadow-2xl dark-scrollbar"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#334155] transition-all z-10"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffc425] to-[#ffd768] flex items-center justify-center shadow-lg shadow-[#ffc425]/20">
                <Zap size={32} className="text-[#020617]" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {mode === 'signin' ? 'Welcome Back' : 'Join JalaneaWorks'}
              </h2>
              <p className="text-[#94a3b8]">
                {mode === 'signin'
                  ? 'Sign in to your account'
                  : <>Get matched with jobs that actually want <span className="text-[#ffc425]">your degree</span>.</>
                }
              </p>
            </div>

            {/* Error/Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                {message}
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white rounded-xl font-semibold text-[#1f2937] hover:bg-gray-50 transition-all mb-4 disabled:opacity-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#64748b] mb-6">
              <Check size={14} className="text-green-400" />
              <span>2-minute setup &bull; No credit card required</span>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[#334155]" />
              <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffc425]" />
                Or with {authMethod}
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffc425]" />
              </span>
              <div className="flex-1 h-px bg-[#334155]" />
            </div>

            {/* Auth Method Tabs */}
            <div className="flex bg-[#1e293b] rounded-xl p-1 mb-6">
              {authMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setAuthMethod(method.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    authMethod === method.id
                      ? 'bg-[#0f172a] text-white shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {method.icon}
                  {method.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Password Auth Form */}
              {authMethod === 'password' && (
                <div className="space-y-4">
                  {/* Full Name (Signup only) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-[#94a3b8] mb-2">Full Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full py-3.5 px-4 pl-12 rounded-xl bg-[#020617] border-2 border-[#334155] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] focus:ring-4 focus:ring-[#ffc425]/10 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full py-3.5 px-4 pl-12 rounded-xl bg-[#020617] border-2 border-[#334155] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] focus:ring-4 focus:ring-[#ffc425]/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                        className="w-full py-3.5 px-4 pl-12 pr-12 rounded-xl bg-[#020617] border-2 border-[#334155] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] focus:ring-4 focus:ring-[#ffc425]/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Signup only) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-[#94a3b8] mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                          className="w-full py-3.5 px-4 pl-12 pr-12 rounded-xl bg-[#020617] border-2 border-[#334155] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] focus:ring-4 focus:ring-[#ffc425]/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Forgot Password Link (Signin only) */}
                  {mode === 'signin' && (
                    <div className="flex justify-end">
                      <button type="button" className="text-sm text-[#ffc425] hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#ffc425] to-[#ffd768] rounded-xl font-bold text-[#020617] hover:shadow-lg hover:shadow-[#ffc425]/30 transition-all mt-6 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="inline-block w-5 h-5 border-2 border-[#020617] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock size={18} />
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Passkey Auth */}
              {authMethod === 'passkey' && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-2xl bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
                      <Fingerprint size={40} className="text-[#ffc425]" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">Use Your Passkey</h3>
                    <p className="text-sm text-[#94a3b8] max-w-xs mx-auto">
                      Securely sign in with your device&apos;s biometric authentication or security key.
                    </p>
                  </div>

                  {/* Email for Passkey */}
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required={mode === 'signup'}
                        className="w-full py-3.5 px-4 pl-12 rounded-xl bg-[#020617] border-2 border-[#334155] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] focus:ring-4 focus:ring-[#ffc425]/10 transition-all"
                      />
                    </div>
                    {mode === 'signin' && (
                      <p className="text-xs text-[#64748b] mt-1">
                        Optional - leave empty to use any saved passkey
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#ffc425] to-[#ffd768] rounded-xl font-bold text-[#020617] hover:shadow-lg hover:shadow-[#ffc425]/30 transition-all mt-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="inline-block w-5 h-5 border-2 border-[#020617] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Fingerprint size={18} />
                        {mode === 'signin' ? 'Sign In with Passkey' : 'Register Passkey'}
                      </>
                    )}
                  </button>
                </div>
              )}

            </form>

            {/* Toggle Mode */}
            <div className="text-center mt-6 pt-6 border-t border-[#1e293b]">
              <span className="text-[#94a3b8]">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                onClick={toggleMode}
                className="text-[#ffc425] font-medium hover:underline inline-flex items-center gap-1"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Terms */}
            <p className="text-xs text-center text-[#64748b] mt-4">
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#ffc425] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#ffc425] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal
