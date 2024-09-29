import { dialog } from 'electron'
import { socket } from './MessageManager'
import { createReadStream, mkdirSync, createWriteStream, unlink, statSync } from 'node:fs'
import { logger } from './Logger'
import { uploadFileProcessHttps, downloadFileProcessHttps } from './HttpsFileProcess'
import { uploadFileProcessFtps, downloadFileProcessFtps } from './FtpsFileProcess'
import { encrypt, decrypt } from './AESModule'
import { __download_dir_path } from './Constants'
import { join } from 'node:path'
import { createPipeProgress } from './util/PipeProgress'
import cq from 'concurrent-queue'

// upload queue
// can return promise, but not needed
const uploadQueue = cq()
  .limit({ concurrency: 1 })
  .process(async (filePath) => {
    let key = null
    let iv = null
    let encryptedStream = null
    let fileStream = null
    try {
      fileStream = createReadStream(filePath)
      logger.info('Encrypting file...')
      ;({ key, iv, encryptedStream } = await encrypt(fileStream))
    } catch (error) {
      logger.error(`Failed to create stream or encrypt file: ${error}. Upload aborted.`)
      return
    }
    logger.info('Sending key and iv to server...')
    socket.emit('upload-file-pre', key, iv, (error, uploadId) => {
      if (error) {
        logger.error(`Failed to upload file: ${error}. Upload aborted.`)
        return
      }
      logger.info(`Uploading file ${filePath} with protocol ${process.env.FILE_PROTOCOL}`)
      // upload progress
      if (process.env.FILE_PROTOCOL === 'https') {
        const PipeProgress = createPipeProgress({ total: statSync(filePath).size }, logger)
        encryptedStream.pipe(PipeProgress)
        uploadFileProcessHttps(PipeProgress, filePath, uploadId)
      } else if (process.env.FILE_PROTOCOL === 'ftps') {
        uploadFileProcessFtps(encryptedStream, filePath, uploadId)
      } else {
        logger.error('Invalid file protocol')
      }
    })
  })

const uploadFileProcess = async () => {
  logger.info('Browsing file...')
  // TODO: may need to store and use main window id
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  if (filePaths.length > 0) {
    for (const filePath of filePaths) {
      uploadQueue(filePath)
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
  logger.info(`Asking for file ${uuid}...`)
  socket.emit('download-file-pre', uuid)
}
socket.on('download-file-res', async (uuid, filename, key, iv, size) => {
  try {
    mkdirSync(__download_dir_path, { recursive: false })
  } catch (error) {
    if (error.code !== 'EEXIST') {
      logger.error(`Failed to create downloads directory: ${error}. Download aborted.`)
    }
  }
  const filePath = join(__download_dir_path, filename)
  const writeStream = createWriteStream(filePath)
  writeStream.on('error', (err) => {
    logger.error(`Failed to write file ${filename}: ${err}. Download aborted.`)
    unlink(filePath)
  })
  writeStream.on('finish', () => {
    logger.info(`Downloaded file ${filename} to ${filePath}`)
  })
  const decipher = await decrypt(key, iv, writeStream)
  logger.info(`Downloading file ${uuid} with protocol ${process.env.FILE_PROTOCOL}...`)
  // download progress
  const PipeProgress = createPipeProgress({ total: size }, logger)
  PipeProgress.pipe(decipher)
  decipher.pipe(writeStream)
  if (process.env.FILE_PROTOCOL === 'https') {
    downloadFileProcessHttps(uuid, PipeProgress, filePath)
  } else if (process.env.FILE_PROTOCOL === 'ftps') {
    downloadFileProcessFtps(uuid, PipeProgress, filePath)
  } else {
    logger.error('Invalid file protocol')
  }
})

const deleteFileProcess = (uuid) => {
  logger.info(`Deleting file ${uuid}...`)
  socket.emit('delete-file', uuid)
}

export { uploadFileProcess, getFileListProcess, downloadFileProcess, deleteFileProcess }
