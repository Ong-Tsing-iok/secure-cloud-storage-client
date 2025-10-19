import sss from 'shamirs-secret-sharing'
import crypto from 'crypto'
import { logger } from './Logger'

const algorithm = 'aes-256-cbc'

function getKeyIv(sk) {
  const hash = crypto.createHash('sha512')
  hash.update(sk)
  const digest = hash.digest()
  const key = digest.subarray(0, 32)
  const iv = digest.subarray(32, 48)
  return { key, iv }
}

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
