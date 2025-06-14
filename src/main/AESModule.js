import crypto from 'crypto'
import { Readable } from 'stream'
import KeyManager from './KeyManager'

class AESModule {
  keyManager
  /**
   *
   * @param {KeyManager} keyManager
   */
  constructor(keyManager) {
    this.keyManager = keyManager
  }

  async encrypt(readstream) {
    const { messageArray, cipher, spk } = await this.keyManager.randCipher()
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
  async decrypt(cipher, spk, proxied = false) {
    const message = await this.keyManager.decrypt(cipher, spk, proxied, true)
    // decode key and iv
    const streamDecipher = crypto.createDecipheriv(
      'aes-256-cbc',
      message.buffer.slice(0, 32),
      message.buffer.slice(32, 48)
    )
    return streamDecipher
  }
}

export default AESModule
