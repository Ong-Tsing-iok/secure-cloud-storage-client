import io from 'socket.io-client'
import { logger } from './Logger'
import GlobalValueManager from './GlobalValueManager'
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
  GlobalValueManager.sendNotice('Server reconnected', 'success')
  // login()
})

socket.io.on('close', () => {
  logger.info('connection closed')
  GlobalValueManager.loggedIn = false
  GlobalValueManager.sendNotice('Server connection closed', 'error')
})

export function sendMessage(message) {
  socket.emit('message', message)
}

export { socket }
