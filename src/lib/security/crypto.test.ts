import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encryptSecret, decryptSecret, maskKey, getMasterKey } from './crypto';

describe('AES-256-GCM Secret Encryption Helper', () => {
  const originalEnv = process.env.APP_ENCRYPTION_KEY;
  const testKey = '50e52b17f7392f1c100c8979945f01453966981eee22dff943820018d64d008f';

  beforeEach(() => {
    process.env.APP_ENCRYPTION_KEY = testKey;
  });

  afterEach(() => {
    process.env.APP_ENCRYPTION_KEY = originalEnv;
  });

  it('encrypts then decrypts back to the original secret', () => {
    const plain = 'finnhub_secret_api_key_12345';
    const blob = encryptSecret(plain);

    expect(blob).not.toBe(plain);
    expect(blob).not.toContain(plain);

    const decrypted = decryptSecret(blob);
    expect(decrypted).toBe(plain);
  });

  it('two encryptions of the same value produce different ciphertexts due to random IV', () => {
    const plain = 'secret_token_abc';
    const blob1 = encryptSecret(plain);
    const blob2 = encryptSecret(plain);

    expect(blob1).not.toBe(blob2);
    expect(decryptSecret(blob1)).toBe(plain);
    expect(decryptSecret(blob2)).toBe(plain);
  });

  it('fails decryption with tampered ciphertext or auth tag', () => {
    const plain = 'super_secret';
    const blob = encryptSecret(plain);
    const rawBuffer = Buffer.from(blob, 'base64');

    // Flip a byte in the ciphertext payload
    rawBuffer[rawBuffer.length - 1] ^= 0xff;
    const tampered = rawBuffer.toString('base64');

    expect(() => decryptSecret(tampered)).toThrow();
  });

  it('throws an error if APP_ENCRYPTION_KEY is missing or invalid length', () => {
    process.env.APP_ENCRYPTION_KEY = '';
    expect(() => getMasterKey()).toThrow(/missing/i);

    process.env.APP_ENCRYPTION_KEY = 'too-short';
    expect(() => getMasterKey()).toThrow(/32 bytes/i);
  });

  it('correctly masks keys to show only last 4 characters', () => {
    expect(maskKey('my_secret_token_a3f9')).toBe('••••a3f9');
    expect(maskKey('a3f9')).toBe('••••a3f9');
    expect(maskKey(null)).toBe('••••');
    expect(maskKey(undefined)).toBe('••••');
  });
});

