import { socket } from './MessageManager'
import { logger } from './Logger'
import { Client } from 'basic-ftp'

const ftpPort = 7002
const uploadFileProcessFtps = async (fileStream) => {
  const client = new Client()
  try {
    let response = await client.access({
      host: 'localhost',
      port: ftpPort,
      user: socket.id,
      password: 'password',
      secure: true,
      // TODO: remove insecure option in production
      secureOptions: { rejectUnauthorized: process.env.NODE_ENV !== 'production' ? false : true }
    })
    logger.info(`ftp upload access response: ${response.message}`)
    response = await client.uploadFrom(fileStream, fileStream.path)
    logger.info(`ftp upload response: ${response.message}`)
    logger.info(`upload with ftps succeeded`)
  } catch (error) {
    logger.error(`upload with ftps failed: ${error}`)
  }
  client.close()
}

const downloadFileProcessFtps = async (uuid) => {
  const client = new Client()
  try {
    let response = await client.access({
      host: 'localhost',
      port: ftpPort,
      user: socket.id,
      password: 'password',
      secure: true,
      // TODO: remove insecure option in production
      secureOptions: { rejectUnauthorized: process.env.NODE_ENV !== 'production' ? false : true }
    })
    logger.info(`ftp download access response: ${response.message}`)
    response = await client.downloadTo(`downloads/${uuid}`, uuid) // TODO: make sure the directory is created
    logger.info(`ftp download response: ${response.message}`)
    // TODO: get file name from server and replace uuid
    logger.info(`download with ftps succeeded`)
  } catch (error) {
    logger.error(`download with ftps failed: ${error}`)
  }
  client.close()
}

export { uploadFileProcessFtps, downloadFileProcessFtps }
