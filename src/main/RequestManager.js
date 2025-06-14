import { socket } from './MessageManager'
import { logger } from './Logger'
import GlobalValueManager from './GlobalValueManager'
import KeyManager from './KeyManager'

class RequestManager {
  keyManager
  /**
   *
   * @param {KeyManager} keyManager
   */
  constructor(keyManager) {
    this.keyManager = keyManager

    socket.on('rekey-ask', async (pk, cb) => {
      const rekey = await keyManager.rekeyGen(pk)
      cb(rekey)
    })
    socket.on('new-request', () => {
      logger.info('New request coming')
      this.getRequestedListProcess()
    })
    socket.on('new-response', () => {
      logger.info('New response coming')
      this.getRequestListProcess()
    })
  }

  requestFileProcess(requestInfo) {
    logger.info(`Asking to request file ${requestInfo.fileId}...`)
    socket.emit('request-file', requestInfo, (error) => {
      if (error) {
        logger.error(`Failed to request file ${requestInfo.fileId}: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to request file', 'error')
      } else {
        logger.info(`Success to request file ${requestInfo.fileId}`)
        this.getRequestListProcess()
        GlobalValueManager.mainWindow?.webContents.send(
          'notice',
          'Success to request file',
          'success'
        )
      }
    })
  }

  getRequestListProcess() {
    logger.info('Getting request list...')
    socket.emit('get-request-list', (result, error) => {
      if (error) {
        logger.error(`Failed to get request list: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send(
          'notice',
          'Failed to get request list',
          'error'
        )
      } else {
        logger.info(`Success to get request list`)
        GlobalValueManager.mainWindow?.webContents.send('request-list-res', result)
      }
    })
  }

  getRequestedListProcess() {
    socket.emit('get-requested-list', (result, error) => {
      logger.info('Getting requested list...')
      if (error) {
        logger.error(`Failed to get requested list: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send(
          'notice',
          'Failed to get requested list',
          'error'
        )
      } else {
        logger.info(`Success to get requested list`)
        this.autoReplyProcess(result)
        GlobalValueManager.mainWindow?.webContents.send('requested-list-res', result)
      }
    })
  }

  async autoReplyProcess(result) {
    let changed = false
    const resultList = JSON.parse(result)
    for (const item of resultList) {
      if (item.agreed === null || item.agreed === undefined) {
        console.log('item not responded')
        console.log(item.requester)
        // Check if in black list
        if (GlobalValueManager.userListConfig.blackList.includes(item.requester)) {
          // console.log('blacklisted item')
          changed = true
          await this.respondRequestProcess(
            {
              requestId: item.requestId,
              agreed: false,
              description: '',
              pk: item.pk,
              spk: item.spk
            },
            false
          )
          // item.agreed = 0
        } else if (GlobalValueManager.userListConfig.whiteList.includes(item.requester)) {
          changed = true
          console.log('whitelist item')
          await this.respondRequestProcess(
            {
              requestId: item.requestId,
              agreed: true,
              description: '',
              pk: item.pk,
              spk: item.spk
            },
            false
          )
          // item.agreed = 1
        }
      }
    }
    if (changed) {
      this.getRequestedListProcess()
    }
  }

  deleteRequestProcess(requestId) {
    logger.info(`Deleting request for ${requestId}...`)
    socket.emit('delete-request', requestId, (error) => {
      if (error) {
        logger.error(`Failed to delete request for ${requestId}: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send(
          'notice',
          'Failed to delete request',
          'error'
        )
      } else {
        logger.info(`Success to delete request for ${requestId}`)
        this.getRequestListProcess()
        GlobalValueManager.mainWindow?.webContents.send(
          'notice',
          'Success to delete request',
          'success'
        )
      }
    })
  }

  agreeRequestProcess(uuid) {
    socket.emit('request-agree', uuid)
    logger.info(`Agree request for ${uuid}...`)
  }

  rejectRequestProcess(uuid) {
    socket.emit('request-reject', uuid)
    logger.info(`Reject request for ${uuid}...`)
  }

  async respondRequestProcess(responseInfo, refresh = true) {
    logger.info(`Respond request for ${responseInfo.requestId}...`)
    let rekey = null
    if (responseInfo.agreed) {
      try {
        rekey = await this.keyManager.rekeyGen(responseInfo.pk, responseInfo.spk)
      } catch (error) {
        logger.error(`Failed to generate rekey: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send(
          'notice',
          'Failed to respond request',
          'error'
        )
        return
      }
    }
    delete responseInfo.pk
    delete responseInfo.spk
    return new Promise((resolve, reject) => {
      socket.emit('respond-request', { ...responseInfo, rekey }, (error) => {
        if (error) {
          logger.error(`Failed to respond request for ${responseInfo.requestId}: ${error}`)
          GlobalValueManager.mainWindow?.webContents.send(
            'notice',
            'Failed to respond request',
            'error'
          )
          resolve()
        } else {
          logger.info(`Success to respond request for ${responseInfo.requestId}`)
          if (refresh) {
            this.getRequestedListProcess()
          }
          GlobalValueManager.mainWindow?.webContents.send(
            'notice',
            'Success to respond request',
            'success'
          )
          resolve()
        }
      })
    })
  }
}

export default RequestManager
