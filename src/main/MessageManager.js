import io from 'socket.io-client'
import { logger } from './Logger'
import { initKeys, decrypt, getPublicKey } from './KeyManager'
import GlobalValueManager from './GlobalValueManager'
import { getFileListProcess } from './FileManager'
import { getRequestedListProcess, getRequestListProcess } from './RequestManager'

const socket = io(GlobalValueManager.httpsUrl, {
  // reconnectionAttempts: 10,
  rejectUnauthorized: false
})

socket.on('message', (message) => {
  // console.log(message)
  logger.log('info', `received message from server: ${message}`)
})

socket.on('connect_error', (error) => {
  if (socket.active) {
    // temporary failure, the socket will automatically try to reconnect
    logger.info("Can't connect to server. Trying to reconnect...")
  } else {
    // the connection was denied by the server
    // in that case, `socket.connect()` must be manually called in order to reconnect
    logger.error(`connection failed with following error: ${error.message}`)
    // console.log(error.message);
  }
})

socket.io.on('reconnect_failed', () => {
  logger.error('reconnection failed. The server might be down.')
})

socket.io.on('reconnect', () => {
  logger.info('server reconnected')
  // login()
})

socket.io.on('close', () => {
  logger.info('connection closed')
})

export function sendMessage(message) {
  socket.emit('message', message)
}

// Login part
async function respondToAuth(cipher) {
  logger.info('Getting login response from server. Decrypting auth key...')

  const decryptedValue = await decrypt(cipher)
  logger.debug(`decryptedValue: ${decryptedValue}`)
  logger.info('Finish decrypting. Sending response back to server')
  socket.emit('auth-res', decryptedValue, (error, userId) => {
    if (error) {
      logger.error(`Authentication response failed because of following error: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to authenticate', 'error')
      return
    }
    if (userId) {
      logger.info('Login succeeded')
      GlobalValueManager.userId = userId
      // TODO: invoke all process of getting list
      // TODO: make it a function so that it can be called when login/reconnect
      //? can we ensure we logged in first?
      getFileListProcess(null)
      getRequestListProcess()
      getRequestedListProcess()
      // TODO: send userId and other stored name, email to renderer
      GlobalValueManager.mainWindow?.webContents.send('user-info', {
        name: GlobalValueManager.userConfig.name,
        email: GlobalValueManager.userConfig.email,
        userId: GlobalValueManager.userId
      })
      GlobalValueManager.mainWindow?.webContents.send('request-value', {
        seenReplies: GlobalValueManager.requestConfig.seenReplies,
        seenRequests: GlobalValueManager.requestConfig.seenRequests
      })
      GlobalValueManager.mainWindow?.webContents.send('user-list', {
        whiteList: GlobalValueManager.userListConfig.whiteList,
        blackList: GlobalValueManager.userListConfig.blackList
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

async function register(name, email) {
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

export { login, register, socket }
