import { socket } from './MessageManager'
import { logger } from './Logger'
import { rekeyGen } from './KeyManager'
import { error } from 'winston'
import GlobalValueManager from './GlobalValueManager'

const requestFileProcess = (requestInfo) => {
  logger.info(`Asking to request file ${requestInfo.fileId}...`)
  socket.emit('request-file', requestInfo, (error) => {
    if (error) {
      logger.error(`Failed to request file ${requestInfo.fileId}: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to request file', 'error')
    } else {
      logger.info(`Success to request file ${requestInfo.fileId}`)
      GlobalValueManager.mainWindow?.webContents.send(
        'notice',
        'Success to request file',
        'success'
      )
    }
  })
}

const getRequestListProcess = () => {
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

const getRequestedListProcess = () => {
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
      GlobalValueManager.mainWindow?.webContents.send('requested-list-res', result)
    }
  })
}

const deleteRequestProcess = (uuid) => {
  socket.emit('delete-request', uuid)
  logger.info(`Deleting request for ${uuid}...`)
}

const agreeRequestProcess = (uuid) => {
  socket.emit('request-agree', uuid)
  logger.info(`Agree request for ${uuid}...`)
}

socket.on('rekey-ask', async (pk, cb) => {
  const rekey = await rekeyGen(pk)
  cb(rekey)
})

const rejectRequestProcess = (uuid) => {
  socket.emit('request-reject', uuid)
  logger.info(`Reject request for ${uuid}...`)
}

export {
  getRequestListProcess,
  getRequestedListProcess,
  deleteRequestProcess,
  agreeRequestProcess,
  rejectRequestProcess,
  requestFileProcess
}
