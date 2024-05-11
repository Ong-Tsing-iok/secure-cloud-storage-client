import io from 'socket.io-client'

const url = 'http://localhost:3001'
const socket = io(url)

socket.on('message', (message) => {
  console.log(message)
})

export function sendMessage(message) {
  socket.emit('message', message)
}
