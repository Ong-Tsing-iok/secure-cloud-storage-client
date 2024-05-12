import io from 'socket.io-client'
import { getLogger } from './Logger'

const url = 'http://localhost:3001'
const socket = io(url, {
  reconnectionAttempts: 10
})

socket.on('message', (message) => {
  // console.log(message)
  getLogger().log('info', `received message: ${message}`)
})

socket.on('connect_error', (error) => {
  if (socket.active) {
    // temporary failure, the socket will automatically try to reconnect
    // getLogger().info('temperal connection failure')
  } else {
    // the connection was denied by the server
    // in that case, `socket.connect()` must be manually called in order to reconnect
    getLogger().error(`Connedction failed with following error: ${error.message}`)
    // console.log(error.message);
  }
})

socket.io.on('reconnect_failed', () => {
  getLogger().error('reconnection failed. The server might be down.')
})

export function sendMessage(message) {
  socket.emit('message', message)
}
