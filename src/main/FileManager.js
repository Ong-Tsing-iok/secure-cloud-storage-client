import { dialog } from 'electron'
import { socket } from './MessageManager'
import { createReadStream, mkdirSync, createWriteStream, unlink } from 'node:fs'
import { logger } from './Logger'
import { uploadFileProcessHttps, downloadFileProcessHttps } from './HttpsFileProcess'
import { uploadFileProcessFtps, downloadFileProcessFtps } from './FtpsFileProcess'
import { encrypt, decrypt } from './AESModule'
import { __dirname, __download_dir } from './Constants'
import { join } from 'node:path'

const uploadFileProcess = async () => {
  logger.info('Browsing file...')
  // TODO: may need to store and use main window id
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if (filePaths.length > 0) {
    let key = null
    let iv = null
    let encryptedStream = null
    let fileStream = null
    const filePath = filePaths[0]
    try {
      fileStream = createReadStream(filePath)
      logger.info('Encrypting file...')
      ;({ key, iv, encryptedStream } = encrypt(fileStream))
    } catch (error) {
      logger.error(`Failed to create stream or encrypt file: ${error}. Upload aborted.`)
      return
    }
    logger.info(`Uploading file ${filePath} with protocol ${process.env.FILE_PROTOCOL}`)
    if (process.env.FILE_PROTOCOL === 'https') {
      uploadFileProcessHttps(encryptedStream, filePath)
    } else if (process.env.FILE_PROTOCOL === 'ftps') {
      uploadFileProcessFtps(encryptedStream, filePath)
    } else {
      logger.error('Invalid file protocol')
    }
  }
}

const getFileListProcess = () => {
  logger.info('Getting file list...')
  socket.emit('get-file-list')
}
socket.on('file-list-res', (fileList) => {
  logger.info(`File list: ${fileList}`)
})

const downloadFileProcess = (uuid) => {
  logger.info(`Getting filename for file ${uuid}...`)
  socket.emit('download-file-pre', uuid)
}
socket.on('download-file-res', (uuid, filename) => {
  // TODO: also get the aes keys
  try {
    mkdirSync(join(__dirname, __download_dir), { recursive: false })
  } catch (error) {
    if (error.code !== 'EEXIST') {
      logger.error(`Failed to create downloads directory: ${error}. Download aborted.`)
    }
  }
  const filePath = join(__dirname, __download_dir, filename)
  const writeStream = createWriteStream(filePath)
  writeStream.on('error', (err) => {
    logger.error(`Failed to write file ${filename}: ${err}. Download aborted.`)
    unlink(filePath)
  })
  writeStream.on('finish', () => {
    logger.info(`Downloaded file ${filename} to ${filePath}`)
  })
  const decipher = decrypt(/*key, iv*/ writeStream)
  logger.info(`Downloading file ${uuid} with protocol ${process.env.FILE_PROTOCOL}...`)
  if (process.env.FILE_PROTOCOL === 'https') {
    downloadFileProcessHttps(uuid, decipher, filePath)
  } else if (process.env.FILE_PROTOCOL === 'ftps') {
    downloadFileProcessFtps(uuid, decipher, filePath)
  } else {
    logger.error('Invalid file protocol')
  }
})

const deleteFileProcess = (uuid) => {
  logger.info(`Deleting file ${uuid}...`)
  socket.emit('delete-file', uuid)
}

export { uploadFileProcess, getFileListProcess, downloadFileProcess }
