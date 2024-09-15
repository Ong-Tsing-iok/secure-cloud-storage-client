import { logger } from './Logger'
import { readFile, writeFile } from 'node:fs/promises'
import { PythonShell } from 'python-shell'
import { join } from 'node:path'

//TODO: check argument format before executing PythonShell
//TODO: maybe should be stored and read from file
const params =
  '{"g": "eJw9UEsOQjEIvErTdRel/3oVY5qneTt3T02M8e4y0LoooTMwA3zsGLf7dhxj2JOx1/djP6wzjL62+3MX9Jy6M7k5U7IzyFtxhrx3pgJkoDBQ+eXEBHHolT9Bq4mYaZEfoQ2lFQmEhPazqYqscNOMqCEIRCqfoMxU91OjiiqMAzKCa5wjQSJ4baAQQGelyePns+6A6dSPZmhizPKpaUn22thh2XVD5HqHOPdfoutKWDn9tw06luriphiE4L3WbGkdMc46CZit0OX7A0m4Upk=", "u": "eJw1UEEOAjEI/ErTcw/QbQvrV4xpVrO3va2aGOPfhUIPbWCAmYFv7P1xbOfZe7yEeP889zOmIOh7O177QK9lTaFyCm21N/KSAiKlQEsKDJLkLImioIhWqrasXtIBEpJ1PikQGa7dtQn5mCiWIMjHmiwuxRJQ1kSCIhycbUa5EASog0DV8nQkrVXNNJNHoKkDFjAKgS4AxdURcK4xhaqtYwzodNnOMQBuvg64WXM8jWGWnsYuUNjdKS+CntQvQX67Mai3U4cNb78/0oxR1A==", "v": "eJxNUEEOwjAM+8q08w5J1zQpX0GoGmi33QZICPF30iRDXNLUdhy377G127bse2vjaRivr/u6j9Og6HPZHquh51yngWQaWE9MoAW1UOlN6oW0gHaskBivyirRIIpTfzcOHsrhloKypptV+PGqLjXg3Mdn1c2HYUqO1OprMvsdgdyuWD5FSS2FXeGglqIjDL6PbWcO5zy7FAEjhSW0F3Y76Qs7BRAx7CuIPC5FWkTVELu2xlyu4cspvpHFx6S4WiKBRelpC14+X9yjUuI=", "Z": "eJxNUstOxDAM/JWo5x7itI4TfgWtqgXtbW8FJIT4dzx+VBzcJrE9npnkZzmO9+f9PI9jeSnL2/fH41zWoqdf9+fnw05fmdbCYy1Up34aYbWvZehutLWIaLD/Lcu6GVogFZWbZ1E5ugbjMNp2CVSJqgnM6pVEmuXNcQamUndwSQo2Vv+cOIY8RpDT3s6RmRlgC5wabSTB0hFtYWJr7Mi4BO5EG8RfrVQd0IShdgcPmkmzOYyp0pjDiRGZIr7GgZc2sSL0Hk6w93Yt4IYiQ+wunCl7baoupKVR2+VHwPZIw0uMcP49LkqcLGaaN5gpjoW5KLaYSZn2i/fIm5IAkLiBGuOhAoimLL0xKemFJPb1tmCzOwSEnnNBBg/A1Ey3wS7ApfSA8Eu051hDXU1XWsvnwv+d2F0xnkun2+8fa8GTVA=="}'

const keyFilePath = 'nal16.keys'
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
      const genKeys = await PythonShell.run(join(__dirname, 'py', 'crypto.py'), {
        args: ['--keygen', '-P', `${params}`]
      })
      await writeFile(keyFilePath, genKeys.join('\n'))
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
  const cipher = await PythonShell.run(join(__dirname, 'py', 'crypto.py'), {
    args: ['--encrypt', '-P', `${params}`, '-p', `${keys['p']}`, '-m', `${message}`]
  })
  logger.info('Message encrypted.')
  return cipher[0]
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
  const message = await PythonShell.run(join(__dirname, 'py', 'crypto.py'), {
    args: [
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
    ]
  })
  logger.info('Message decrypted.')
  return message[0]
}

/**
 *
 * @param {string} requesterPublicKey
 * @returns {Promise<string>} rekey
 */
const rekeyGen = async (requesterPublicKey) => {
  checkInit()
  logger.info('Generating rekey...')
  const rekey = await PythonShell.run(join(__dirname, 'py', 'crypto.py'), {
    args: ['--rekeygen', '-p', `${requesterPublicKey}`, '-s', `${keys['s']}`]
  })
  logger.info('Rekey generated.')
  return rekey[0]
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
