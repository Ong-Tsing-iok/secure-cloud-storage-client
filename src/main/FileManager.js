import { dialog, BrowserWindow } from 'electron'
import { socket } from './MessageManager'
import { createReadStream, mkdirSync, createWriteStream, unlink, statSync } from 'node:fs'
import { logger } from './Logger'
import { uploadFileProcessHttps, downloadFileProcessHttps } from './HttpsFileProcess'
import { uploadFileProcessFtps, downloadFileProcessFtps } from './FtpsFileProcess'
import { encrypt, decrypt } from './AESModule'
import { __download_dir_path } from './Constants'
import path, { join } from 'node:path'
import { createPipeProgress } from './util/PipeProgress'
import cq from 'concurrent-queue'
import GlobalValueManager from './GlobalValueManager'

// upload queue
// can return promise, but not needed
const uploadQueue = cq()
  .limit({ concurrency: 1 })
  .process(async ({ filePath, parentFolderId }) => {
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
    socket.emit('upload-file-pre', key, iv, parentFolderId, (error, uploadId) => {
      if (error) {
        logger.error(`Failed to upload file: ${error}. Upload aborted.`)
        return
      }
      logger.info(
        `Uploading file ${filePath} with protocol ${GlobalValueManager.serverConfig.protocol}`
      )
      // upload progress
      if (GlobalValueManager.serverConfig.protocol === 'https') {
        const PipeProgress = createPipeProgress({ total: statSync(filePath).size }, logger)
        encryptedStream.pipe(PipeProgress)
        uploadFileProcessHttps(PipeProgress, filePath, uploadId)
      } else if (GlobalValueManager.serverConfig.protocol === 'ftps') {
        uploadFileProcessFtps(encryptedStream, filePath, uploadId)
      } else {
        logger.error('Invalid file protocol')
      }
    })
  })

const uploadFileProcess = async (parentFolderId) => {
  logger.info('Browsing file...')
  // TODO: may need to store and use main window id
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  if (filePaths.length > 0) {
    for (const filePath of filePaths) {
      uploadQueue({ filePath, parentFolderId })
    }
  }
}

const getFileListProcess = (parentFolderId) => {
  logger.info(`Getting file list for ${parentFolderId || 'root'}...`)
  socket.emit('get-file-list', parentFolderId, (fileList) => {
    GlobalValueManager.mainWindow?.webContents.send('file-list-res', fileList)
  })
}
socket.on('file-list-res', (fileList) => {
  GlobalValueManager.mainWindow?.webContents.send('file-list-res', fileList)
  // logger.info(`File list: ${fileList}`)
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
  logger.info(
    `Downloading file ${uuid} with protocol ${GlobalValueManager.serverConfig.protocol}...`
  )
  // download progress
  const PipeProgress = createPipeProgress({ total: size }, logger)
  PipeProgress.pipe(decipher)
  decipher.pipe(writeStream)
  if (GlobalValueManager.serverConfig.protocol === 'https') {
    downloadFileProcessHttps(uuid, PipeProgress, filePath)
  } else if (GlobalValueManager.serverConfig.protocol === 'ftps') {
    downloadFileProcessFtps(uuid, PipeProgress, filePath)
  } else {
    logger.error('Invalid file protocol')
  }
})

const deleteFileProcess = (uuid) => {
  logger.info(`Asking to delete file ${uuid}...`)
  socket.emit('delete-file', uuid, (error) => {
    if (error) {
      logger.error(`Failed to delete file ${uuid}: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to delete file', 'error')
    } else {
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Success to delete file', 'success')
      getFileListProcess(GlobalValueManager.curFolderId)
    }
  })
}

const addFolderProcess = (curPath, folderName) => {
  logger.info(`Asking to add folder ${folderName}...`)
  socket.emit('add-folder', curPath, folderName, (error) => {
    if (error) {
      logger.error(`Failed to add folder ${folderName}: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to add folder', 'error')
    } else {
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Success to add folder', 'success')
    }
  })
}

const deleteFolderProcess = (folderId) => {
  logger.info(`Asking to delete folder ${folderId}...`)
  socket.emit('delete-folder', folderId, (error) => {
    if (error) {
      logger.error(`Failed to delete folder: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to delete folder', 'error')
    } else {
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Success to delete folder', 'success')
    }
  })
}

export {
  uploadFileProcess,
  getFileListProcess,
  downloadFileProcess,
  deleteFileProcess,
  addFolderProcess,
  deleteFolderProcess
}
