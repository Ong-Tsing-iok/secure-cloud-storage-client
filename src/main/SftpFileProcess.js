/**
 * This file handles actual file upload and download using SFTP protocol.
 */
import ssh2 from 'ssh2'
import { logger } from './Logger'
import GlobalValueManager from './GlobalValueManager'
import { socket } from './MessageManager'
const { Client } = ssh2

/**
 * Uploads a file to an SFTP server.
 * @param {string} tempEncryptedFilePath - The stream of the file to be uploaded.
 * @param {string} originalFileName - The path of the file to be uploaded (related to fileStream).
 * @param {string} fileId
 * @param {FileUploadCoordinator} fileUploadCoordinator
 */
export const uploadFileProcessSftp = async (
  tempEncryptedFilePath,
  originalFileName,
  fileId,
  fileUploadCoordinator
) => {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn
      .on('ready', () => {
        logger.info('Sftp client ready.')
        conn.sftp((err, sftp) => {
          if (err) {
            return reject(err)
          }
          sftp.fastPut(tempEncryptedFilePath, originalFileName, (err) => {
            if (err) {
              return reject(err)
            }
            logger.info('Upload with sftp succeeded.')
            conn.end()
            // Call upload coordinator
            fileUploadCoordinator.finishUpload(fileId, tempEncryptedFilePath)
            resolve()
          })
        })
      })
      .on('error', (err) => {
        reject(err)
      })
      .connect({
        host: GlobalValueManager.serverConfig.host,
        port: GlobalValueManager.serverConfig.port.sftp,
        username: socket.id,
        password: fileId
      })
  })
}

/**
 * Downloads a file from the SFTP server.
 *
 * @param {string} fileId - The unique identifier of the file.
 * @param {WritableStream} writeStream - The stream to write the downloaded file to.
 * @param {string} filePath - The path to save the downloaded file (related to writeStream).
 * @return {Promise<void>} A promise that resolves when the download is complete.
 */
export const downloadFileProcessSftp = async (fileId, writeStream, filePath) => {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn
      .on('ready', () => {
        logger.info('Sftp client ready.')
        conn.sftp((err, sftp) => {
          if (err) {
            return reject(err)
          }
          const readStream = sftp.createReadStream(fileId)
          readStream.on('error', (err) => {
            reject(err)
          })
          readStream.on('close', () => {
            logger.info('Download with sftp succeeded.')
            conn.end()
            resolve()
          })
          readStream.pipe(writeStream)
        })
      })
      .on('error', (err) => {
        reject(err)
      })
      .connect({
        host: GlobalValueManager.serverConfig.host,
        port: GlobalValueManager.serverConfig.port.sftp,
        username: socket.id,
        password: fileId
      })
  })
}
