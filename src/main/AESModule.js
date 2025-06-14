import crypto from 'crypto'
import { Readable } from 'stream'
import keyManager from './KeyManager'

const encrypt = async (readstream) => {
  const { messageArray, cipher, spk } = await keyManager.randCipher()
  const key = messageArray.buffer.slice(0, 32)
  const iv = messageArray.buffer.slice(32, 48)
  const streamCipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encryptedStream = Readable.from(readstream.pipe(streamCipher))
  // encode key and iv
  return {
    cipher,
    spk,
    encryptedStream
  }
}

/**
 *
 * @param {string} cipher
 * @param {string} spk
 * @param {boolean} proxied
 * @returns crypto.Decipher
 */
const decrypt = async (cipher, spk, proxied = false) => {
  const message = await keyManager.decrypt(cipher, spk, proxied, true)
  // decode key and iv
  const streamDecipher = crypto.createDecipheriv(
    'aes-256-cbc',
    message.buffer.slice(0, 32),
    message.buffer.slice(32, 48)
  )
  return streamDecipher
}

export { encrypt, decrypt }
