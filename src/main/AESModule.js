import crypto from 'crypto'
import { Readable } from 'stream'
import { toBufferBE, toBigIntBE } from 'bigint-buffer'
import * as KeyManager from './KeyManager'

// const key = crypto.randomBytes(32)
// const iv = crypto.randomBytes(16)

const encrypt = async (readstream) => {
  const key = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encryptedStream = Readable.from(readstream.pipe(cipher))
  // encode key and iv with elgamal
  const keyCipherPair = await KeyManager.encrypt(toBigIntBE(key))
  const ivCipherPair = await KeyManager.encrypt(toBigIntBE(iv))
  // console.log(key.toString('hex'), iv.toString('hex'))
  return { key: keyCipherPair, iv: ivCipherPair, encryptedStream }
}

const decrypt = async (keyCipherPair, ivCipherPair, writestream) => {
  // decode key and iv with elgamal
  const keyDecipher = await KeyManager.decrypt(keyCipherPair.c1, keyCipherPair.c2)
  const ivDecipher = await KeyManager.decrypt(ivCipherPair.c1, ivCipherPair.c2)
  // console.log(keyDecipher.toString(16), ivDecipher.toString(16))
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(keyDecipher.toString(16), 'hex'),
    Buffer.from(ivDecipher.toString(16), 'hex')
  )
  decipher.pipe(writestream)
  return decipher
}

export { encrypt, decrypt }
