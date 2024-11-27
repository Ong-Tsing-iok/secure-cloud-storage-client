import { logger } from './Logger'
import { readFile, writeFile } from 'node:fs/promises'
import {
  pre_schema1_DecryptLevel1,
  pre_schema1_DecryptLevel2,
  pre_schema1_Encrypt,
  pre_schema1_KeyGen,
  pre_schema1_MessageGen,
  pre_schema1_ReKeyGen,
  pre_schema1_SigningKeyGen
} from '@aldenml/ecc'
import GlobalValueManager from './GlobalValueManager'

const keyFilePath = GlobalValueManager.keyPath
let keys
let signingKeys

const checkInit = () => {
  if (!keys || !signingKeys) {
    throw new Error('Keys are not initialized')
  }
}

const initKeys = async () => {
  if (keys && signingKeys) {
    return
  }
  logger.info('Initializing keys...')
  try {
    const content = (await readFile(keyFilePath, 'utf-8')).split('\n')
    keys = {
      pk: new Uint8Array(Buffer.from(content[0], 'base64')),
      sk: new Uint8Array(Buffer.from(content[1], 'base64'))
    }
    signingKeys = {
      spk: new Uint8Array(Buffer.from(content[2], 'base64')),
      ssk: new Uint8Array(Buffer.from(content[3], 'base64'))
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.info('Keys not found. Creating keys...')
      keys = await pre_schema1_KeyGen()
      signingKeys = await pre_schema1_SigningKeyGen()
      if (!keys || !signingKeys) throw new Error('Failed to generate keys')
      const keysStr = `${Buffer.from(keys.pk).toString('base64')}\n${Buffer.from(keys.sk).toString('base64')}\n${Buffer.from(signingKeys.spk).toString('base64')}\n${Buffer.from(signingKeys.ssk).toString('base64')}`
      await writeFile(keyFilePath, keysStr)
    } else {
      throw error
    }
  }
  if (
    keys.pk.length !== 48 ||
    keys.sk.length !== 32 ||
    signingKeys.spk.length !== 32 ||
    signingKeys.ssk.length !== 64
  ) {
    throw new Error('Keys are not in correct format')
  }

  logger.info('Keys initialized.')
}
/**
 *
 * @param {string} message
 * @returns {Promise<string>} encrypted cipher
 */
const encrypt = async (message) => {
  checkInit()
  logger.info('Encrypting message...')
  const cipher = await pre_schema1_Encrypt(message, keys.pk, signingKeys)
  if (cipher === null) throw new Error('Failed to encrypt message')
  logger.debug(`cipher: ${cipher}`)
  logger.info('Message encrypted.')
  return {
    cipher: Buffer.from(cipher).toString('base64'),
    spk: Buffer.from(signingKeys.spk).toString('base64')
  }
}

/**
 *
 * @param {string} cipher
 * @param {string} spk
 * @param {boolean} proxied proxied by server or not, default as false
 * @returns {Promise<string | Uint8Array>} decrypted message
 */
const decrypt = async (cipher, spk, proxied = false, toArray = false) => {
  checkInit()
  logger.debug(`cipher: ${cipher}`)
  logger.debug(`spk: ${spk}`)
  logger.info('Decrypting message...')
  const cipherArray = new Uint8Array(Buffer.from(cipher, 'base64'))
  const spkArray = new Uint8Array(Buffer.from(spk, 'base64'))
  let messageArray
  if (proxied) {
    messageArray = await pre_schema1_DecryptLevel2(cipherArray, keys.sk, spkArray)
  } else {
    messageArray = await pre_schema1_DecryptLevel1(cipherArray, keys.sk, spkArray)
  }
  if (messageArray === null) throw new Error('Failed to decrypt cipher')
  logger.info('Message decrypted.')
  if (toArray) {
    return messageArray
  }
  const message = Buffer.from(messageArray).toString('base64')
  logger.debug(`decrypted message: ${message}`)
  return message
}

/**
 *
 * @param {string} requesterPublicKey
 * @param {string} spk
 * @returns {Promise<string>} rekey
 */
const rekeyGen = async (requesterPublicKey, spk) => {
  // currently only single signkey for all files
  checkInit()
  logger.info('Generating rekey...')
  const reqPublicKeyArray = new Uint8Array(Buffer.from(requesterPublicKey, 'base64'))
  // const spkArray = new Uint8Array(Buffer.from(spk, 'base64'))
  const rekeyArray = await pre_schema1_ReKeyGen(keys.sk, reqPublicKeyArray, signingKeys)
  if (rekeyArray === null) throw new Error('Failed to generate rekey')
  const rekey = Buffer.from(rekeyArray).toString('base64')
  logger.debug(`rekey: ${rekey}`)
  logger.info('Rekey generated.')
  return rekey
}

/**
 *
 * @returns {Promise<{ messageArray: Uint8Array, message: string, cipher: string, spk: string }>}
 */
const randCipher = async () => {
  checkInit()
  const messageArray = await pre_schema1_MessageGen()
  const cipher = await pre_schema1_Encrypt(messageArray, keys.pk, signingKeys)
  if (cipher === null) throw new Error('Failed to encrypt message')
  return {
    messageArray,
    cipher: Buffer.from(cipher).toString('base64'),
    spk: Buffer.from(signingKeys.spk).toString('base64')
  }
}
/**
 *
 * @returns {string} public key
 */
const getPublicKeyString = () => {
  checkInit()
  return Buffer.from(keys.pk).toString('base64')
}

const getKeys = () => {
  checkInit()
  return keys
}

const getSigningKeys = () => {
  checkInit()
  return signingKeys
}

export {
  initKeys,
  encrypt,
  decrypt,
  rekeyGen,
  getPublicKeyString,
  getKeys,
  getSigningKeys,
  randCipher
}
