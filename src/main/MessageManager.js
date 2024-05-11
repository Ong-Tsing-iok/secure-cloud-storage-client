import io from 'socket.io-client'
import { getLogger } from './Logger'

const url = 'http://localhost:3001'
const socket = io(url)

socket.on('message', (message) => {
  // console.log(message)
  getLogger().log('info', `received message: ${message}`)
})

export function sendMessage(message) {
  socket.emit('message', message)
}
