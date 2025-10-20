import { logger } from './Logger'
import { socket } from './MessageManager'
import GlobalValueManager from './GlobalValueManager'
import KeyManager from './KeyManager'
import RequestManager from './RequestManager'
import FileManager from './FileManager'
import BlockchainManager from './BlockchainManager'
import { encryptDataShareKey, recoverDataShareKey } from './SecretSharing'
import { UnexpectedErrorMsg } from './Utils'

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
          GlobalValueManager.sendNotice('Failed to authenticate', 'error')
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
      GlobalValueManager.sendNotice('Failed to authenticate', 'error')
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
          GlobalValueManager.sendNotice('Failed to login', 'error')
          return
        }
        this.respondToAuth(cipher, spk)
      })
    } catch (error) {
      logger.error(`login failed because of following error: ${error}`)
      GlobalValueManager.sendNotice('Failed to login', 'error')
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
      GlobalValueManager.sendNotice('Failed to register', 'error')
    }
  }

  async shareSecret({ extraKey }) {
    return new Promise((resolve, reject) => {
      try {
        const secretKeys = {
          walletKey: this.blockchainManager.wallet.privateKey,
          preKeys: this.keyManager.getKeyStrings()
        }
        logger.info('Generating secret shares...')
        const shares = encryptDataShareKey(extraKey, JSON.stringify(secretKeys))
        const sharesStr = []
        for (const share of shares) {
          sharesStr.push(share.toString('base64'))
        }
        logger.info('Asking to share secret keys.')
        socket.emit('secret-share', { shares: sharesStr }, (response) => {
          if (response.errorMsg) {
            logger.error(`Secret share failed because of following error: ${response.errorMsg}`)
            reject(response.errorMsg)
            // GlobalValueManager.sendNotice('Failed to share secret', 'error')
            return
          }
          resolve()
          // GlobalValueManager.sendNotice('Share secret succeeded', 'success')
        })
      } catch (error) {
        logger.error(error)
        // GlobalValueManager.sendNotice('Failed to share secret', 'error')
        reject(UnexpectedErrorMsg)
      }
    })
  }

  async recoverSecret({ email }) {
    return new Promise((resolve, reject) => {
      try {
        logger.info('Asking to recover secret.')
        socket.emit('secret-recover', { email }, (response) => {
          if (response.errorMsg) {
            logger.error(`Secret recover failed because of following error: ${response.errorMsg}`)
            // GlobalValueManager.sendNotice('Failed to recover secret', 'error')
            reject(response.errorMsg)
            return
          }
          // Ask user to input email authentication code
          // GlobalValueManager.mainWindow?.send('ask-email-auth', { purpose: 'recover' })
          resolve()
        })
      } catch (error) {
        logger.error(error)
        // GlobalValueManager.sendNotice('Failed to recover secret', 'error')
        reject(UnexpectedErrorMsg)
      }
    })
  }

  async onEmailAuth({ emailAuth, purpose }) {
    return new Promise((resolve, reject) => {
      try {
        // const ActionStr = (purpose == 'recover') ? 'Secret recover' :
        logger.info('Asking to email auth')
        socket.emit('email-auth-res', { emailAuth }, (response) => {
          if (response.errorMsg) {
            logger.error(
              `Email authentication failed because of following error: ${response.errorMsg}`
            )
            // GlobalValueManager.sendNotice('Email authentication failed', 'error')
            reject(response.errorMsg)
            return
          }
          if (response.shares) {
            const deserializedShares = []
            for (const share of response.shares) {
              deserializedShares.push(Buffer.from(share, 'base64'))
            }
            this.shares = deserializedShares
            // Ask user to input extra key
            // GlobalValueManager.mainWindow?.send('ask-extra-key')
            resolve({ purpose: 'recover' })
          } else {
            resolve()
          }
        })
      } catch (error) {
        logger.error(error)
        reject(UnexpectedErrorMsg)
        // GlobalValueManager.sendNotice('Email authentication failed', 'error')
      }
    })
  }

  async onRecoverExtraKey({ extraKey }) {
    return new Promise((resolve, reject) => {
      try {
        const decryptedStr = recoverDataShareKey(extraKey, this.shares)
        if (!decryptedStr) {
          logger.info('Secret key recover failed.')
          // GlobalValueManager.sendNotice(
          //   'Secret keys could not be recovered because not enough shares were retrieved. Please contact the server manager.',
          //   'error'
          // )
          reject(
            'Secret keys could not be recovered because not enough shares were retrieved or extra key is wrong.'
          )
          return
        }
        const secretKeys = JSON.parse(decryptedStr)
        this.blockchainManager.restoreWallet(secretKeys.walletKey)
        this.keyManager.restoreKeys(secretKeys.preKeys)
        logger.info('Secret key recovered')
        // GlobalValueManager.sendNotice('Secret keys successfully recovered.', 'success')
        this.login()
        resolve()
      } catch (error) {
        logger.error(error)
        // GlobalValueManager.sendNotice('Secret keys could not be recovered.', 'error')
        reject(UnexpectedErrorMsg)
      }
    })
  }
}

export default LoginManager
