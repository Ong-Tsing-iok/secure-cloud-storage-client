import io from 'socket.io-client'
import { logger } from './Logger'
import { decrypt, getKeyPublic } from './KeyManager'

const url = 'https://localhost:3001'
const socket = io(url, {
  reconnectionAttempts: 10,
  rejectUnauthorized: false
})

socket.on('message', (message) => {
  // console.log(message)
  logger.log('info', `received message as client: ${message}`)
})

socket.on('connect_error', (error) => {
  if (socket.active) {
    // temporary failure, the socket will automatically try to reconnect
    // logger.info('temperal connection failure')
  } else {
    // the connection was denied by the server
    // in that case, `socket.connect()` must be manually called in order to reconnect
    logger.error(`Connedction failed with following error: ${error.message}`)
    // console.log(error.message);
  }
})

socket.io.on('reconnect_failed', () => {
  logger.error('reconnection failed. The server might be down.')
})

export function sendMessage(message) {
  socket.emit('message', message)
}
// Login part
socket.on('login-res', async (c1, c2) => {
  logger.info('Getting login response from server. Decrypting auth key...')
  const decryptedValue = await decrypt(c1, c2)
  logger.debug(`decryptedValue: ${decryptedValue}`)
  logger.info('Finish decrypting. Sending response back to server')
  socket.emit('login-auth', decryptedValue)
})

socket.on('login-auth-res', (message) => {
  if (message == 'OK') {
    logger.info('Login succeeded')
    // TODO: store some variable indicating logged in
  } else {
    logger.warn('Login failed. There might be problem with your keys')
  }
})
/**
 * @todo First get the keys. Then emit login-ask to server with public key.
 * Then wait for server to send back auth message, decode it and send back to server.
 */
async function login() {
  try {
    const engine = await getKeyPublic()
    logger.info('Asking to login...')
    logger.debug(`p:${engine.p}, g:${engine.g}, y:${engine.y}`)
    socket.emit('login-ask', engine.p, engine.g, engine.y)
  } catch (error) {
    logger.error(`login failed because of following error: ${error}`)
  }
}

export { login, socket }
