import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server'
import type { Passkey } from '@/types/auth'

// Relying Party (RP) configuration
const rpName = 'Jalanea Works'

// Get RP ID based on environment
// IMPORTANT: RP ID must be a stable domain, not Vercel preview URLs
function getRpId(): string {
  // Use explicit production domain if set (required for passkeys to work)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  }
  // Fallback for development
  return 'localhost'
}

// Get expected origin based on environment
function getExpectedOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  return 'http://localhost:3000'
}

export async function generatePasskeyRegistrationOptions(
  userId: string,
  userEmail: string,
  existingPasskeys: Passkey[]
) {
  const rpId = getRpId()

  const options = await generateRegistrationOptions({
    rpName,
    rpID: rpId,
    userID: new TextEncoder().encode(userId),
    userName: userEmail,
    userDisplayName: userEmail.split('@')[0],
    // Discourage authenticators that don't support user verification
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
    // Exclude existing passkeys so user doesn't register the same one twice
    excludeCredentials: existingPasskeys.map((passkey) => ({
      id: passkey.credential_id,
      transports: passkey.transports || undefined,
    })),
    // Timeout in milliseconds (5 minutes)
    timeout: 300000,
  })

  return options
}

export async function verifyPasskeyRegistration(
  response: RegistrationResponseJSON,
  expectedChallenge: string
) {
  const rpId = getRpId()
  const expectedOrigin = getExpectedOrigin()

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpId,
    requireUserVerification: false,
  })

  return verification
}

export async function generatePasskeyAuthenticationOptions(
  existingPasskeys?: Passkey[]
) {
  const rpId = getRpId()

  const options = await generateAuthenticationOptions({
    rpID: rpId,
    userVerification: 'preferred',
    // If we have existing passkeys, allow only those
    allowCredentials: existingPasskeys?.map((passkey) => ({
      id: passkey.credential_id,
      transports: passkey.transports || undefined,
    })),
    // Timeout in milliseconds (5 minutes)
    timeout: 300000,
  })

  return options
}

export async function verifyPasskeyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  passkey: Passkey
) {
  const rpId = getRpId()
  const expectedOrigin = getExpectedOrigin()

  // Decode the base64url-encoded public key
  const publicKeyBuffer = Buffer.from(passkey.public_key, 'base64url')

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpId,
    requireUserVerification: false,
    credential: {
      id: passkey.credential_id,
      publicKey: new Uint8Array(publicKeyBuffer),
      counter: passkey.counter,
      transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
    },
  })

  return verification
}
