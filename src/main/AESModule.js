import crypto from 'crypto'
import Stream, { Readable } from 'stream'
import KeyManager from './KeyManager'
import { logger } from './Logger'

// TODO: change the name
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

    // Test for encryption error
    // encryptedStream.emit('error', new Error('Test encryption error.'))

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

  /**
   *
   * @param {Stream} cipherStream the stream to hash
   * @param {(digest:string)=>void | Promise<void>} callback the callback to call with digest
   */
  makeHash(cipherStream, callback) {
    const hash = crypto.createHash('sha256')
    cipherStream.pipe(hash)

    hash.on('finish', async () => {
      logger.info(`Finish hash calculation.`)
      try {
        const digest = '0x' + hash.digest('hex') // Append 0x for it to be able to convert to BigInt
        await callback(digest)
      } catch (error) {
        logger.error(error)
      }
    })
  }

  makeHashPromise(cipherStream) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256')
      cipherStream.pipe(hash)

      hash.on('finish', () => {
        logger.info(`Finish hash calculation.`)
        const digest = '0x' + hash.digest('hex')
        resolve(digest)
      })
      hash.on('error', (err) => {
        reject(err)
      })
      // Test hash error
      // hash.emit('error', new Error('Test hash error.'))
    })
  }
}

export default AESModule
