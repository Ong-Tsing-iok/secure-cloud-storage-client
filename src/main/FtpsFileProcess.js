import { socket } from './MessageManager'
import { logger } from './Logger'
import { Client } from 'basic-ftp'
import { basename } from 'node:path'

const ftpPort = 7002

/**
 * Uploads a file to an FTPS server.
 *
 * @param {ReadableStream} fileStream - The stream of the file to be uploaded.
 * @param {string} filePath - The path of the file to be uploaded (related to fileStream).
 * @return {Promise<void>} A promise that resolves when the upload is complete.
 */
const uploadFileProcessFtps = async (fileStream, filePath) => {
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
    response = await client.uploadFrom(fileStream, basename(filePath))
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
 * @param {WritableStream} writeStream - The stream to write the downloaded file to.
 * @param {string} filePath - The path to save the downloaded file (related to writeStream).
 * @return {Promise<void>} A promise that resolves when the download is complete.
 */
const downloadFileProcessFtps = async (uuid, writeStream, filePath) => {
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
    response = await client.downloadTo(writeStream, uuid) // TODO: make sure the directory is created
    logger.info(`ftp download response: ${response.message}`)
    // TODO: get file name from server and replace uuid
    // logger.info(`download with ftps succeeded. File saved at ${filePath}`)
  } catch (error) {
    logger.error(`download with ftps failed: ${error}`)
  }
  client.close()
}

export { uploadFileProcessFtps, downloadFileProcessFtps }
