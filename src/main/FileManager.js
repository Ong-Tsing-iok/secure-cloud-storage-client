import { dialog } from 'electron'
import { socket } from './MessageManager'
import { createReadStream, mkdirSync } from 'node:fs'
import { logger } from './Logger'
import { uploadFileProcessHttps, downloadFileProcessHttps } from './HttpsFileProcess'
import { uploadFileProcessFtps, downloadFileProcessFtps } from './FtpsFileProcess'

const uploadFileProcess = async () => {
  logger.info('Browsing file...')
  // TODO: may need to store and use main window id
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if (filePaths.length > 0) {
    const filePath = filePaths[0]
    const fileStream = createReadStream(filePath)

    logger.info(`Uploading file ${filePath} with protocol ${process.env.FILE_PROTOCOL}`)
    console.log(`upload start: ${Date.now()}`)
    if (process.env.FILE_PROTOCOL === 'https') {
      uploadFileProcessHttps(fileStream)
    } else if (process.env.FILE_PROTOCOL === 'ftps') {
      uploadFileProcessFtps(fileStream)
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
  try {
    mkdirSync('downloads', { recursive: false })
  } catch (error) {
    if (error.code !== 'EEXIST') {
      logger.error(`Failed to create downloads directory: ${error}. Download aborted.`)
    }
  }
  logger.info(`Downloading file ${uuid} with protocol ${process.env.FILE_PROTOCOL}...`)
  console.log(`download start: ${Date.now()}`)
  if (process.env.FILE_PROTOCOL === 'https') {
    downloadFileProcessHttps(uuid)
  } else if (process.env.FILE_PROTOCOL === 'ftps') {
    downloadFileProcessFtps(uuid, filename)
  } else {
    logger.error('Invalid file protocol')
  }
})

const deleteFileProcess = (uuid) => {
  logger.info(`Deleting file ${uuid}...`)
  socket.emit('delete-file', uuid)
}

export { uploadFileProcess, getFileListProcess, downloadFileProcess }
