import { logger } from './Logger'
import { readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import GlobalValueManager from './GlobalValueManager'
const exec = promisify(execFile)

//TODO: check argument format before executing PythonShell
//TODO: maybe should be stored and read from file
const params =
  '{"g": "ZUp3OVVMc093akFNL0pXb2M0YTRKSTdEcnlBVUZkU3RXd0VKSWY0ZG41MHlPSDdlblozUDFQdDlXL2E5OStrY3B0djdzZTVUREZwOUxkdHp0ZW9sdHhpS3hGQ3JXb2tocTZkMDBxUjVVZFJuOFZ5MFRuT0tvYWtSQVpyY0tCVzBhRVIxOXBrQ0FJR1NHQzNCa1BhcURqTEkxYmNoUURRQUlzN0pNaUROZG1xK0lORWhZbXMyRzZvdWFSU1ZCNThoMkxmT1dDUmxQT1R5QlFrVmw4U3VScDZVUmJUREEydEM4Zy9HdGFVNm50bGpnOWwvQUh0b2VnZFl3bjlpdnZpNU12dnB5Sm11M3gvMjJGSEw=", "u": "ZUp3OVVNc093eUFNK3hYVU00ZUU4Z2o3bFdsQzNkUmJiOTBtVGRQK2ZUR2h2U0JpSE52NE83WDIySlo5YjIyNnVPbitlYTc3NUoyaTcyVjdyUjI5eHVwZEV1K0V2Q3ZzSFhQR29STlRVbmoyTHV0elZVQjBqanFYQ0FZdWNsS3owYktxU1RUcVFhK0tjUWhLaDhVQW9GZUx6c0VXbUdab1JRc2hCUVBiVTRVTFFZU1JWWGtTaGlLem5JblZMU2N6eUIwdDQ0Z3kySW5HS2xCOG9pZURjVlFnNGZQRTQ5OEYyMVNPS01rSzRzQzJtWTRLY3VmRjBZV2xET1lKd1c1SHFKZEhWZWx3WUFvR283UE10OThma1ZwU29RPT0=", "v": "ZUp4TlVEc093akFNdlVxVU9ZT2R4bkhEVlJDS0N1cldyWUNFRUhmSGRzeG5TT1A2MmUrVForejlzaTM3M25zOGhIaCtYTmM5cGlEZCs3TGRWdXNlUzB1QjVoUm11Vm5Pbk9XZlVrREVGQnBySVNqTFFSQ29Dc1JadXdaVldhaGpFYUY0bTdMUEFHb25qM1ZXT0lQQTdHcDZzMCtRb0EwR1V6VTI5VVR1Slp1aWpKVHBUMVdKYkE1Umhvb1VOTG5OWW43aHc4WCtVVG5OcEVybUJXSDZjcUJuTlVVTk05c3pnRk4vMW9CK2oyVldMQmhJMGFUVDFMYUdoSkVKb1hsOEdxQkpHQW1paFdualVTdWVYbTlWMzFNNQ==", "Z": "ZUp4TlVzdE94REFNL0pXcTV4N2lObzRkZmdXaGFrRjcyOXNDRWtMOE94NC9GZzZiVGYyWThVejh2WjduMisxeXY1L24rclNzcjEvdjEvdTZMUmI5dk53K3JoNTladG9XMW0yUnZpMXpic3NZOW0vZmF0L1U3T2lIQmNTS0xDRlp3QTNKM1E3aXlOQnVYOEtaeGgwdDFqNEtjOFpQS1l0Qk1CM0hza01UbEE0Y1ZpY0FiV2dBVGFPYVNMT0RTSEJMZWdBNU13T2RLdE96aXlnMVVLTDdCSWlVWE1ma0kwdGFDeEdQWmlqemJDdG1rQXk3S0VZOGdzdEpkUVFxaFBjVTd5MGRiYlJudVpzSDR0MGdaYzltMFRJV1FqbUgrNHVpM2FuVlVlM29Hb0RkYSt3eU9BSmV4c1lwSUxDQXVETDU1Nmh6aHhJT0Q4R2tMWjBIZlRqUTR6Mm5wQlNIb2xGNEdrVHVyTC81S05remx3Z0RvY3ozeGMyVWNNZTNTbXNLcmZKeUdGdXBYRzh2OVJwSmlDaFdFdHFoRUlDK2QrWDBmSmdpWWZtZ2w1OWZoU3VTK2c9PQ=="}'

const keyFilePath = GlobalValueManager.keysConfig.path
const keys = {}

const checkInit = () => {
  if (!keys['p'] || !keys['s']) {
    throw new Error('Keys are not initialized')
  }
}

const initKeys = async () => {
  if (keys['p'] && keys['s']) {
    return
  }
  logger.info('Initializing keys...')
  try {
    const content = (await readFile(keyFilePath, 'utf-8')).split('\n')
    keys['p'] = content[0]
    keys['s'] = content[1]
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.info('Keys not found. Creating keys...')
      const { stdout } = await exec(GlobalValueManager.cryptoPath, ['--keygen', '-P', `${params}`])
      await writeFile(keyFilePath, stdout)
      const genKeys = stdout.split('\n')
      keys['p'] = genKeys[0]
      keys['s'] = genKeys[1]
    } else {
      throw error
    }
  }
  const keyFormatRe = /^[a-zA-Z0-9+/=]+$/
  if (!(keys['p'] && keys['s']) || !keyFormatRe.test(keys['p']) || !keyFormatRe.test(keys['s'])) {
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
  const { stdout: cipher } = await exec(GlobalValueManager.cryptoPath, [
    '--encrypt',
    '-P',
    `${params}`,
    '-p',
    `${keys['p']}`,
    '-m',
    `${message}`
  ])
  logger.info('Message encrypted.')
  return cipher
}

/**
 *
 * @param {string} cipher
 * @param {boolean} proxied proxied by server or not, default as false
 * @returns {Promise<string>} decrypted message
 */
const decrypt = async (cipher, proxied = false) => {
  checkInit()
  logger.info('Decrypting message...')
  const { stdout: message } = await exec(GlobalValueManager.cryptoPath, [
    '--decrypt',
    '-P',
    `${params}`,
    '-p',
    `${keys['p']}`,
    '-s',
    `${keys['s']}`,
    '-c',
    `${cipher}`,
    ...(proxied ? [] : ['--owned'])
  ])
  logger.info('Message decrypted.')
  return message
}

/**
 *
 * @param {string} requesterPublicKey
 * @returns {Promise<string>} rekey
 */
const rekeyGen = async (requesterPublicKey) => {
  checkInit()
  logger.info('Generating rekey...')
  const { stdout: rekey } = await exec(GlobalValueManager.cryptoPath, [
    '--rekeygen',
    '-p',
    `${requesterPublicKey}`,
    '-s',
    `${keys['s']}`
  ])
  logger.info('Rekey generated.')
  return rekey
}
/**
 *
 * @returns {string} public key
 */
const getPublicKey = () => {
  checkInit()
  return keys['p']
}

export { initKeys, encrypt, decrypt, rekeyGen, getPublicKey }
