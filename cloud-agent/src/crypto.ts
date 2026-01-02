/**
 * Encryption utilities for sensitive credential storage
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from 'crypto';

// Encryption key from environment (should be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_KEY?.slice(0, 32) || 'default-key-change-in-production';

// Ensure key is exactly 32 bytes
function getKey(): Buffer {
  const key = ENCRYPTION_KEY;
  if (key.length < 32) {
    // Pad with zeros if too short
    return Buffer.from(key.padEnd(32, '0'));
  }
  return Buffer.from(key.slice(0, 32));
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Combine IV + authTag + encrypted data
  // Format: base64(iv):base64(authTag):base64(encrypted)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  const key = getKey();
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt credentials object
 */
export function encryptCredentials(credentials: { email: string; password: string }): string {
  return encrypt(JSON.stringify(credentials));
}

/**
 * Decrypt credentials object
 */
export function decryptCredentials(encryptedData: string): { email: string; password: string } {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}

/**
 * Hash a value (one-way, for verification)
 */
export function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
