import { logger } from './Logger'
import { initKeys, decrypt, getPublicKey } from './KeyManager'
import GlobalValueManager from './GlobalValueManager'
import { getFileListProcess } from './FileManager'
import { getRequestedListProcess, getRequestListProcess } from './RequestManager'
import { socket } from './MessageManager'

async function respondToAuth(cipher) {
  logger.info('Getting login response from server. Decrypting auth key...')

  const decryptedValue = await decrypt(cipher)
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
      // TODO: invoke all process of getting list
      // TODO: make it a function so that it can be called when login/reconnect
      //? can we ensure we logged in first?
      getFileListProcess(null)
      getRequestListProcess()
      getRequestedListProcess()
      // TODO: send userId and other stored name, email to renderer
      GlobalValueManager.mainWindow?.webContents.send('user-info', {
        userInfo
      })
    }
  })
}
async function login() {
  // only login after window is ready to show
  try {
    await initKeys()
    const publicKey = getPublicKey()
    logger.info('Asking to login...')
    socket.emit('login', publicKey, (error, cipher) => {
      if (error) {
        logger.error(`login failed because of following error: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to login', 'error')
        return
      }
      respondToAuth(cipher)
    })
  } catch (error) {
    logger.error(`login failed because of following error: ${error}`)
  }
}

async function register({ name, email }) {
  // only register after window is ready to show
  try {
    await initKeys()
    const publicKey = getPublicKey()
    logger.info('Asking to register...')
    socket.emit('register', publicKey, name, email, (error, cipher) => {
      if (error) {
        logger.error(`register failed because of following error: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to register', 'error')
        return
      }
      respondToAuth(cipher)
    })
  } catch (error) {
    logger.error(`register failed because of following error: ${error}`)
  }
}

export { login, register }
