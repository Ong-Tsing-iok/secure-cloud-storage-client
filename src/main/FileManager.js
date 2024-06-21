import { dialog } from 'electron'
import { socket } from './MessageManager'
import { createReadStream } from 'node:fs'
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
  logger.info(`Asking to download file ${uuid} with protocol ${process.env.FILE_PROTOCOL}`)
  if (process.env.FILE_PROTOCOL === 'https') {
    downloadFileProcessHttps(uuid)
  } else if (process.env.FILE_PROTOCOL === 'ftps') {
    downloadFileProcessFtps(uuid)
  } else {
    logger.error('Invalid file protocol')
  }
}
export { uploadFileProcess, getFileListProcess, downloadFileProcess }
