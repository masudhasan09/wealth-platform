import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Validates and retrieves the 32-byte encryption key buffer from APP_ENCRYPTION_KEY.
 * The key can be provided as a 64-character hex string or 32 raw bytes.
 */
export function getMasterKey(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw || raw.trim() === '') {
    throw new Error('APP_ENCRYPTION_KEY environment variable is missing.');
  }

  const trimmed = raw.trim();
  // 64 hex characters = 32 bytes
  if (trimmed.length === 64 && /^[0-9a-fA-F]+$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }

  const buf = Buffer.from(trimmed, 'utf8');
  if (buf.length !== 32) {
    throw new Error(
      `APP_ENCRYPTION_KEY must be exactly 32 bytes (or 64 hex characters). Received ${buf.length} bytes.`
    );
  }
  return buf;
}

/**
 * Encrypts a plain-text secret using AES-256-GCM.
 * Output blob format: Base64(IV [12 bytes] + AuthTag [16 bytes] + Ciphertext)
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) {
    throw new Error('Cannot encrypt empty or null secret.');
  }

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine IV + AuthTag + Ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypts an encrypted blob created by encryptSecret.
 */
export function decryptSecret(blobBase64: string): string {
  if (!blobBase64) {
    throw new Error('Cannot decrypt empty or null blob.');
  }

  const key = getMasterKey();
  const combined = Buffer.from(blobBase64, 'base64');

  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid ciphertext blob: payload too short.');
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Masks a secret key showing only the last 4 characters e.g. "••••a3f9".
 */
export function maskKey(keyOrLast4: string | null | undefined): string {
  if (!keyOrLast4) return '••••';
  const clean = keyOrLast4.trim();
  const last4 = clean.length > 4 ? clean.slice(-4) : clean;
  return `••••${last4}`;
}

