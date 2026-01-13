import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'

export interface Passkey {
  id: string
  user_id: string
  credential_id: string
  public_key: string
  counter: number
  device_type: string | null
  backed_up: boolean
  transports: AuthenticatorTransportFuture[] | null
  created_at: string
  last_used_at: string | null
}

export interface AuthChallenge {
  id: string
  user_id: string | null
  email: string | null
  challenge: string
  type: 'registration' | 'authentication'
  expires_at: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
}
