import { logger } from './Logger'
import { initKeys, decrypt, getPublicKeyString } from './KeyManager'
import GlobalValueManager from './GlobalValueManager'
import { getFileListProcess } from './FileManager'
import { getRequestedListProcess, getRequestListProcess } from './RequestManager'
import { socket } from './MessageManager'

async function respondToAuth(cipher, spk) {
  logger.info('Getting login response from server. Decrypting auth key...')
  // console.log(cipher)
  try {
    const decryptedValue = await decrypt(cipher, spk)
    logger.debug(`decryptedValue: ${decryptedValue}`)
    logger.info('Finish decrypting. Sending response back to server')
    socket.emit('auth-res', decryptedValue, (error, userInfo) => {
      if (error) {
        logger.error(`Authentication response failed because of following error: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to authenticate', 'error')
        return
      }
      if (userInfo) {
        logger.info('Login succeeded')
        GlobalValueManager.userInfo = userInfo
        GlobalValueManager.loggedIn = true
        getFileListProcess(null)
        getRequestListProcess()
        getRequestedListProcess()
        // send userId and other stored name, email to renderer
        GlobalValueManager.mainWindow?.webContents.send('user-info', userInfo)
      }
    })
  } catch (error) {
    logger.error(`Authentication response failed because of following error: ${error}`)
    GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to authenticate', 'error')
  }
}
async function login() {
  // only login after window is ready to show
  try {
    await initKeys()
    const publicKey = getPublicKeyString()
    logger.info('Asking to login...')
    socket.emit('login', publicKey, (error, cipher, spk) => {
      if (error) {
        logger.error(`login failed because of following error: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to login', 'error')
        return
      }
      respondToAuth(cipher, spk)
    })
  } catch (error) {
    logger.error(`login failed because of following error: ${error}`)
  }
}

async function register({ name, email }) {
  // only register after window is ready to show
  try {
    await initKeys()
    const publicKey = getPublicKeyString()
    logger.info('Asking to register...')
    socket.emit('register', publicKey, name, email, (error, cipher, spk) => {
      if (error) {
        logger.error(`register failed because of following error: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to register', 'error')
        return
      }
      respondToAuth(cipher, spk)
    })
  } catch (error) {
    logger.error(`register failed because of following error: ${error}`)
  }
}

export { login, register }
