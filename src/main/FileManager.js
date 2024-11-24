import { dialog } from 'electron'
import { socket } from './MessageManager'
import { createReadStream, mkdirSync, createWriteStream, unlink, statSync } from 'node:fs'
import { logger } from './Logger'
import { uploadFileProcessHttps, downloadFileProcessHttps } from './HttpsFileProcess'
import { uploadFileProcessFtps, downloadFileProcessFtps } from './FtpsFileProcess'
import { encrypt, decrypt } from './AESModule'
import { basename, join } from 'node:path'
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
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to upload file', 'error')
        return
      }
      logger.info(
        `Uploading file ${basename(filePath)} with protocol ${GlobalValueManager.serverConfig.protocol}`
      )
      try {
        if (GlobalValueManager.serverConfig.protocol === 'https') {
          const PipeProgress = createPipeProgress({ total: statSync(filePath).size }, logger)
          encryptedStream.pipe(PipeProgress)
          uploadFileProcessHttps(PipeProgress, filePath, uploadId)
        } else if (GlobalValueManager.serverConfig.protocol === 'ftps') {
          uploadFileProcessFtps(encryptedStream, filePath, uploadId)
        } else {
          logger.error('Invalid file protocol')
        }
      } catch (error) {
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to upload file', 'error')
      }
    })
  })

const uploadFileProcess = async (parentFolderId) => {
  logger.info('Browsing file...')
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  if (filePaths.length > 0) {
    for (const filePath of filePaths) {
      uploadQueue({ filePath, parentFolderId })
    }
  }
}

socket.on('upload-file-res', (error) => {
  if (error) {
    logger.error(`Failed to upload file: ${error}. Upload aborted.`)
    GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to upload file', 'error')
  } else {
    GlobalValueManager.mainWindow?.webContents.send('notice', 'Success to upload file', 'success')
  }
})

const getFileListProcess = (parentFolderId) => {
  logger.info(`Getting file list for ${parentFolderId || 'home'}...`)
  socket.emit('get-file-list', parentFolderId, (fileList, error) => {
    if (error) {
      logger.error(`Failed to get file list: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to get file list', 'error')
    } else {
      GlobalValueManager.mainWindow?.webContents.send('file-list-res', fileList)
    }
  })
}

const downloadFileProcess = (uuid) => {
  logger.info(`Asking for file ${uuid}...`)
  socket.emit('download-file-pre', uuid, (error, fileInfo) => {
    if (error) {
      logger.error(`Failed to download file: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', `Failed to download file`, 'error')
      return
    }
    if (!fileInfo) {
      //! This should not happen
      logger.error(`File ${uuid} not found`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'File not found', 'error')
      return
    }
    const { id, name, keyCipher, ivCipher, size } = fileInfo
    const proxied = fileInfo.ownerId !== fileInfo.originOwnerId
    downloadFileProcess2(id, name, keyCipher, ivCipher, size, proxied)
  })
}

const downloadFileProcess2 = async (uuid, filename, key, iv, size, proxied) => {
  try {
    try {
      mkdirSync(GlobalValueManager.downloadDir, { recursive: false })
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error
      }
    }
    const filePath = join(GlobalValueManager.downloadDir, filename)
    const writeStream = createWriteStream(filePath)
    writeStream.on('error', (err) => {
      logger.error(`Failed to write file ${filename}: ${err}. Download aborted.`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to download file', 'error')
      try {
        unlink(filePath)
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error
        }
      }
    })
    writeStream.on('finish', () => {
      logger.info(`Downloaded file ${filename} to ${filePath}`)
      GlobalValueManager.mainWindow?.webContents.send(
        'notice',
        'Success to download file',
        'success'
      )
    })
    const decipher = await decrypt(key, iv, proxied)
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
      throw new Error('Invalid file protocol')
    }
  } catch (error) {
    logger.error(`Failed to download file: ${error}. Download aborted.`)
    GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to download file', 'error')
  }
}

const deleteFileProcess = (uuid) => {
  logger.info(`Asking to delete file ${uuid}...`)
  socket.emit('delete-file', uuid, (error) => {
    if (error) {
      logger.error(`Failed to delete file ${uuid}: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to delete file', 'error')
    } else {
      logger.info(`Success to delete file ${uuid}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Success to delete file', 'success')
      getFileListProcess(GlobalValueManager.curFolderId)
    }
  })
}

const addFolderProcess = (parentFolderId, folderName) => {
  logger.info(`Asking to add folder ${folderName}...`)
  socket.emit('add-folder', parentFolderId, folderName, (error) => {
    if (error) {
      logger.error(`Failed to add folder ${folderName}: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to add folder', 'error')
    } else {
      logger.info(`Success to add folder ${folderName}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Success to add folder', 'success')
      getFileListProcess(GlobalValueManager.curFolderId)
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
      logger.info(`Success to delete folder ${folderId}`)
      GlobalValueManager.mainWindow?.webContents.send(
        'notice',
        'Success to delete folder',
        'success'
      )
      getFileListProcess(GlobalValueManager.curFolderId)
    }
  })
}

const getAllFoldersProcess = () => {
  logger.info('Asking for all folders...')
  return new Promise((resolve) => {
    socket.emit('get-all-folders', (folders, error) => {
      if (error) {
        logger.error(`Failed to get all folders: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send(
          'notice',
          'Failed to get all folders',
          'error'
        )
        resolve(null)
      } else {
        resolve(folders)
      }
    })
  })
}

const moveFileProcess = (uuid, targetFolderId) => {
  logger.info(`Asking to move file ${uuid} to ${targetFolderId}...`)
  socket.emit('move-file', uuid, targetFolderId, (error) => {
    if (error) {
      logger.error(`Failed to move file ${uuid} to ${targetFolderId}: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to move file', 'error')
    } else {
      logger.info(`Moved file ${uuid} to ${targetFolderId}`)
      GlobalValueManager.mainWindow?.webContents.send('notice', 'Success to move file', 'success')
      getFileListProcess(GlobalValueManager.curFolderId)
    }
  })
}

const getAllPublicFilesProcess = () => {
  logger.info('Asking for all public files...')
  return new Promise((resolve) => {
    socket.emit('get-public-files', (error, files) => {
      if (error) {
        logger.error(`Failed to get all public files: ${error}`)
        GlobalValueManager.mainWindow?.webContents.send(
          'notice',
          'Failed to get all public files',
          'error'
        )
        resolve(null)
      } else {
        resolve(files)
      }
    })
  })
}

const updateFileDescPermProcess = (uuid, desc, perm) => {
  logger.info(`Asking to update file ${uuid} description and permission...`)
  socket.emit('update-file-desc-perm', uuid, desc, perm, (error) => {
    if (error) {
      logger.error(`Failed to update file ${uuid} description and permission: ${error}`)
      GlobalValueManager.mainWindow?.webContents.send(
        'notice',
        'Failed to update file description and permission',
        'error'
      )
    } else {
      logger.info(`Success to update file ${uuid} description and permission`)
      GlobalValueManager.mainWindow?.webContents.send(
        'notice',
        'Success to update file description and permission',
        'success'
      )
      getFileListProcess(GlobalValueManager.curFolderId)
    }
  })
}

export {
  uploadFileProcess,
  getFileListProcess,
  downloadFileProcess,
  deleteFileProcess,
  addFolderProcess,
  deleteFolderProcess,
  getAllFoldersProcess,
  moveFileProcess,
  getAllPublicFilesProcess,
  updateFileDescPermProcess
}
