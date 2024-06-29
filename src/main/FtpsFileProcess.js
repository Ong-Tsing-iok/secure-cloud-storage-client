import { socket } from './MessageManager'
import { logger } from './Logger'
import { Client } from 'basic-ftp'
import { basename } from 'node:path'

const ftpPort = 7002
/**
 * Uploads a file to an FTPS server.
 *
 * @param {ReadableStream} fileStream - The stream of the file to be uploaded.
 * @return {Promise<void>} A promise that resolves when the upload is complete.
 */
const uploadFileProcessFtps = async (fileStream) => {
  const client = new Client()
  try {
    let response = await client.access({
      host: 'localhost',
      port: ftpPort,
      user: socket.id,
      secure: true,
      // TODO: remove insecure option in production
      // secureOptions: { rejectUnauthorized: process.env.NODE_ENV !== 'production' ? false : true }
      secureOptions: { rejectUnauthorized: false }
    })
    logger.info(`ftp upload access response: ${response.message}`)
    response = await client.uploadFrom(fileStream, basename(fileStream.path))
    console.log(`upload end: ${Date.now()}`)
    logger.info(`ftp upload response: ${response.message}`)
    logger.info(`upload with ftps succeeded`)
  } catch (error) {
    logger.error(`upload with ftps failed: ${error}`)
  }
  client.close()
}

/**
 * Downloads a file from the FTPS server.
 *
 * @param {string} uuid - The unique identifier of the file.
 * @param {string} filename - The name of the file to be stored.
 * @return {Promise<void>} A promise that resolves when the download is complete.
 */
const downloadFileProcessFtps = async (uuid, filename) => {
  const client = new Client()
  try {
    let response = await client.access({
      host: 'localhost',
      port: ftpPort,
      user: socket.id,
      secure: true,
      // TODO: remove insecure option in production
      // secureOptions: { rejectUnauthorized: process.env.NODE_ENV !== 'production' ? false : true }
      secureOptions: { rejectUnauthorized: false }
    })
    logger.info(`ftp download access response: ${response.message}`)
    response = await client.downloadTo(`downloads/${filename}`, uuid) // TODO: make sure the directory is created
    logger.info(`ftp download response: ${response.message}`)
    // TODO: get file name from server and replace uuid
    logger.info(`download with ftps succeeded. File saved as ${filename}`)
    console.log(`download end: ${Date.now()}`)
  } catch (error) {
    logger.error(`download with ftps failed: ${error}`)
  }
  client.close()
}

export { uploadFileProcessFtps, downloadFileProcessFtps }
