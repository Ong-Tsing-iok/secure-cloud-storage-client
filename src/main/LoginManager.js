import { logger } from './Logger'
import { socket } from './MessageManager'
import GlobalValueManager from './GlobalValueManager'
import KeyManager from './KeyManager'
import RequestManager from './RequestManager'
import FileManager from './FileManager'
import BlockchainManager from './BlockchainManager'

class LoginManager {
  blockchainManager
  fileManager
  keyManager
  requestManager
  /**
   * @param {BlockchainManager} blockchainManager
   * @param {FileManager} fileManager
   * @param {KeyManager} keyManager
   * @param {RequestManager} requestManager
   */
  constructor(blockchainManager, fileManager, keyManager, requestManager) {
    this.blockchainManager = blockchainManager
    this.fileManager = fileManager
    this.keyManager = keyManager
    this.requestManager = requestManager
  }

  async respondToAuth(cipher, spk) {
    logger.info('Getting login response from server. Decrypting auth key...')
    // console.log(cipher)
    try {
      const decryptedValue = await this.keyManager.decrypt(cipher, spk)
      logger.debug(`decryptedValue: ${decryptedValue}`)
      logger.info('Finish decrypting. Sending response back to server')
      socket.emit('auth-res', { decryptedValue }, ({ errorMsg, userInfo }) => {
        if (errorMsg) {
          logger.error(`Authentication response failed because of following error: ${errorMsg}`)
          GlobalValueManager.mainWindow?.webContents.send(
            'notice',
            'Failed to authenticate',
            'error'
          )
          return
        }
        if (userInfo) {
          logger.info('Login succeeded')
          GlobalValueManager.userInfo = userInfo
          GlobalValueManager.loggedIn = true
          this.fileManager.getFileListProcess(null)
          this.requestManager.getRequestListProcess()
          this.requestManager.getRequestedListProcess()
          // send userId and other stored name, email to renderer
          GlobalValueManager.mainWindow?.webContents.send('user-info', userInfo)
        }
      })
    } catch (error) {
      logger.error(`Authentication response failed because of following error: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to authenticate', 'error')
    }
  }
  async login() {
    // only login after window is ready to show
    try {
      // await initKeys()
      const publicKey = this.keyManager.getPublicKeyString()
      logger.info('Asking to login...')
      socket.emit('login', { publicKey }, ({ errorMsg, cipher, spk }) => {
        if (errorMsg) {
          logger.error(`login failed because of following error: ${errorMsg}`)
          GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to login', 'error')
          return
        }
        this.respondToAuth(cipher, spk)
      })
    } catch (error) {
      logger.error(`login failed because of following error: ${error}`)
    }
  }

  async register({ name, email }) {
    // only register after window is ready to show
    try {
      // await initKeys()
      const publicKey = this.keyManager.getPublicKeyString()
      logger.info('Asking to register...')
      socket.emit(
        'register',
        { publicKey, blockchainAddress: this.blockchainManager.wallet.address, name, email },
        (response) => {
          if (response.errorMsg) {
            logger.error(`Register failed because of following error: ${response.errorMsg}`)
            GlobalValueManager.sendNotice('Failed to register', 'error')
            return
          }
          this.respondToAuth(response.cipher, response.spk)
        }
      )
    } catch (error) {
      logger.error(`Register failed because of following error: ${error}`)
    }
  }
}
export default LoginManager
