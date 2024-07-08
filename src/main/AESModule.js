import crypto from 'crypto'
import { Readable } from 'stream'

// const key = crypto.randomBytes(32)
// const iv = crypto.randomBytes(16)

const encrypt = (readstream) => {
  const key = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encryptedStream = Readable.from(readstream.pipe(cipher))
  // copy readstream property to encryptedStream
  // Object.assign(encryptedStream, readstream)
  return { key: key.toString('hex'), iv: iv.toString('hex'), encryptedStream }
}

const decrypt = (key, iv, writestream) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  decipher.pipe(writestream)
  return decipher
}

export { encrypt, decrypt }
