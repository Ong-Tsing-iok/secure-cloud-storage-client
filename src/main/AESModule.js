import crypto from 'crypto'
import { Readable } from 'stream'
import * as KeyManager from './KeyManager'

const encrypt = async (readstream) => {
  const key = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encryptedStream = Readable.from(readstream.pipe(cipher))
  // encode key and iv
  const keyCipher = await KeyManager.encrypt(key.toString('hex'))
  const ivCipher = await KeyManager.encrypt(iv.toString('hex'))
  // console.log(key.toString('hex'), iv.toString('hex'))
  return { key: keyCipher, iv: ivCipher, encryptedStream }
}

const decrypt = async (keyCipher, ivCipher) => {
  // decode key and iv
  const keyDecipher = await KeyManager.decrypt(keyCipher)
  const ivDecipher = await KeyManager.decrypt(ivCipher)
  // console.log(keyDecipher.toString(16).length, ivDecipher.toString(16).length)
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(keyDecipher.toString(16).padStart(64, '0'), 'hex'),
    Buffer.from(ivDecipher.toString(16).padStart(32, '0'), 'hex')
  )
  return decipher
}

export { encrypt, decrypt }
