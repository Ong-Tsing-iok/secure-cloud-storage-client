import io from 'socket.io-client'
import { logger } from './Logger'
import { initKeys, decrypt, getPublicKey } from './KeyManager'
import GlobalValueManager from './GlobalValueManager'

const url = `https://${GlobalValueManager.serverConfig.host}:${GlobalValueManager.serverConfig.port}`
const socket = io(url, {
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

socket.io.on('reconnect', () => {
  logger.info('server reconnected')
  login()
})

socket.io.on('close', () => {
  logger.info('connection closed')
})

export function sendMessage(message) {
  socket.emit('message', message)
}
// Login part
socket.on('login-res', async (cipher) => {
  logger.info('Getting login response from server. Decrypting auth key...')

  const decryptedValue = await decrypt(cipher)
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

async function login() {
  try {
    await initKeys()
    const publicKey = getPublicKey()
    logger.info('Asking to login...')
    socket.emit('login-ask', publicKey)
  } catch (error) {
    logger.error(`login failed because of following error: ${error}`)
  }
}

export { login, socket }
