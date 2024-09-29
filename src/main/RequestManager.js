import { socket } from './MessageManager'
import { logger } from './Logger'
import { rekeyGen } from './KeyManager'

const getRequestListProcess = () => {
  socket.emit('get-request-list')
  logger.info('Getting request list...')
}

socket.on('request-list-res', (requestList) => {
  logger.info(`Request list: ${requestList}`)
})

const getRequestedListProcess = () => {
  socket.emit('get-requested-list')
  logger.info('Getting requested list...')
}

socket.on('requested-list-res', (requestedList) => {
  logger.info(`Requested list: ${requestedList}`)
})

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
  rejectRequestProcess
}
