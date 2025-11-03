/**
 * This file handles secret sharing encryption and decryption.
 */
import sss from 'shamirs-secret-sharing'
import crypto from 'crypto'
import { logger } from './Logger'

const algorithm = 'aes-256-cbc'

/**
 * Create an AES key based on the provided extra key.
 * @param {string} sk the extra key
 * @returns the AES key
 */
function getKeyIv(sk) {
  const hash = crypto.createHash('sha512')
  hash.update(sk)
  const digest = hash.digest()
  const key = digest.subarray(0, 32)
  const iv = digest.subarray(32, 48)
  return { key, iv }
}

/**
 * Encrypt the data string with extra key and split it into shares.
 * @param {*} sk
 * @param {*} dataStr
 * @returns
 */
export function encryptDataShareKey(sk, dataStr) {
  // Encrypt data and share sk
  const { key, iv } = getKeyIv(sk)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(dataStr, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const secret = Buffer.from(encrypted)
  const shares = sss.split(secret, { shares: 10, threshold: 2 })
  return shares
}

/**
 * Recover shares and decrypt it with the extra key.
 * @param {*} sk
 * @param {*} shares
 * @returns
 */
export function recoverDataShareKey(sk, shares) {
  const { key, iv } = getKeyIv(sk)
  const recovered = sss.combine(shares).toString()

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decryptedStr = decipher.update(recovered, 'hex', 'utf8')
    decryptedStr += decipher.final('utf8')
    return decryptedStr
  } catch (error) {
    logger.error(error)
    return null
  }
}
