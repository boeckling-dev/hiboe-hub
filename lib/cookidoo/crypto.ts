import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY Umgebungsvariable nicht gesetzt')
  }
  // Key must be 32 bytes for AES-256
  return Buffer.from(key.padEnd(32, '0').slice(0, 32), 'utf-8')
}

/**
 * Encrypt a plaintext string.
 * Returns a base64 string containing IV + ciphertext + auth tag.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf-8', 'base64')
  encrypted += cipher.final('base64')

  const tag = cipher.getAuthTag()

  // Combine IV + tag + ciphertext
  const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'base64')])
  return combined.toString('base64')
}

/**
 * Decrypt a previously encrypted string.
 */
export function decrypt(encrypted: string): string {
  const key = getEncryptionKey()
  const combined = Buffer.from(encrypted, 'base64')

  const iv = combined.subarray(0, IV_LENGTH)
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(ciphertext)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString('utf-8')
}
