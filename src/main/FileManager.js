import { dialog } from 'electron'
import { socket } from './MessageManager'
import { createReadStream, createWriteStream } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { logger } from './Logger'
import { uploadFileProcessHttps, downloadFileProcessHttps } from './HttpsFileProcess'
import { uploadFileProcessFtps, downloadFileProcessFtps } from './FtpsFileProcess'
import { basename, resolve } from 'node:path'
import { createPipeProgress } from './util/PipeProgress'
import cq from 'concurrent-queue'
import GlobalValueManager from './GlobalValueManager'
import AESModule from './AESModule'
import BlockchainManager from './BlockchainManager'
import FileUploadCoordinator from './FileUploadCoordinator'

class FileManager {
  aesModule
  blockchainManager
  uploadQueue
  /**
   * @param {AESModule} aesModule
   * @param {BlockchainManager} blockchainManager
   * @param {number} queueConcurrency
   */
  constructor(aesModule, blockchainManager, queueConcurrency = 1) {
    this.aesModule = aesModule
    this.blockchainManager = blockchainManager
    this.uploadQueue = cq()
      .limit({ concurrency: queueConcurrency })
      .process(this.#uploadProcess.bind(this))

    socket.on('upload-file-res', (response) => {
      if (response.errorMsg) {
        logger.error(
          `Failed to upload file ${response.fileId}: ${response.errorMsg}. Upload aborted.`
        )
        GlobalValueManager.sendNotice(`Failed to upload file ${response.fileId}`, 'error')
      } else {
        GlobalValueManager.sendNotice(`Success to upload file ${response.fileId}`, 'success')
        this.getFileListProcess(GlobalValueManager.curFolderId)
      }
    })
  }

  // can return promise, but not needed
  async #uploadProcess({ filePath, parentFolderId }) {
    let cipher = null
    let spk = null
    let encryptedStream = null
    let fileStream = null
    const originalFileName = basename(filePath)
    try {
      fileStream = createReadStream(filePath)
      logger.info('Encrypting file...')
      ;({ cipher, spk, encryptedStream } = await this.aesModule.encrypt(fileStream))
    } catch (error) {
      logger.error(`Failed to create stream or encrypt file: ${error}. Upload aborted.`)
      return
    }
    logger.info('Sending key and iv to server...')
    socket.emit('upload-file-pre', { cipher, spk, parentFolderId }, async (response) => {
      const { errorMsg, fileId } = response
      if (errorMsg) {
        logger.error(`Failed to upload file: ${errorMsg}. Upload aborted.`)
        GlobalValueManager.sendNotice('Failed to upload file', 'error')
        return
      }

      const tempEncryptedFilePath = resolve(GlobalValueManager.tempPath, fileId)
      const writeStream = createWriteStream(tempEncryptedFilePath)
      const fileUploadCoordinator = new FileUploadCoordinator(
        this.blockchainManager,
        JSON.stringify({ filename: originalFileName })
      )
      this.aesModule.makeHash(encryptedStream, async (digest) => {
        fileUploadCoordinator.finishHash(digest)
      })
      encryptedStream.pipe(writeStream)
      writeStream.on('close', async () => {
        logger.info(`Encrypted file finished writing.`, { tempEncryptedFilePath })

        logger.info(
          `Uploading file ${basename(filePath)} with protocol ${GlobalValueManager.serverConfig.protocol}`
        )
        try {
          if (GlobalValueManager.serverConfig.protocol === 'https') {
            await uploadFileProcessHttps(
              tempEncryptedFilePath,
              originalFileName,
              fileId,
              fileUploadCoordinator
            )
          } else if (GlobalValueManager.serverConfig.protocol === 'ftps') {
            await uploadFileProcessFtps(
              tempEncryptedFilePath,
              originalFileName,
              fileId,
              fileUploadCoordinator
            )
          } else {
            logger.error('Invalid file protocol')
            return
          }
          await fileUploadCoordinator.uploadToBlockchainWhenReady()
          GlobalValueManager.sendNotice(
            'File and info uploaded to server and blockchain.',
            'normal'
          )

          // this.getFileListProcess(GlobalValueManager.curFolderId)
        } catch (error) {
          logger.error(error)
          GlobalValueManager.sendNotice('Failed to upload file', 'error')
        }
      })
    })
  }

  async uploadFileProcess(parentFolderId) {
    logger.info('Browsing file...')
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    })
    if (filePaths.length > 0) {
      for (const filePath of filePaths) {
        this.uploadQueue({ filePath, parentFolderId })
      }
    } else {
      GlobalValueManager.sendNotice('File upload canceled.', 'error')
    }
  }

  getFileListProcess(parentFolderId) {
    logger.info(`Getting file list for ${parentFolderId || 'home'}...`)
    socket.emit('get-file-list', { parentFolderId }, (response) => {
      const { fileList, errorMsg } = response
      if (errorMsg) {
        logger.error(`Failed to get file list: ${errorMsg}`)
        GlobalValueManager.sendNotice('Failed to get file list', 'error')
      } else {
        GlobalValueManager.mainWindow?.webContents.send('file-list-res', fileList)
      }
    })
  }

  downloadFileProcess(fileId) {
    logger.info(`Asking for file ${fileId}...`)
    socket.emit('download-file-pre', { fileId }, async (response) => {
      try {
        if (response.errorMsg) {
          logger.error(`Failed to download file: ${response.errorMsg}`)
          GlobalValueManager.sendNotice(response.errorMsg, 'error')
          return
        }
        if (!response.fileInfo) {
          //! This should not happen
          logger.error(`File ${fileId} not found`)
          GlobalValueManager.sendNotice('File not found', 'error')
          return
        }
        // console.log(fileInfo)
        const blockchainVerification = await this.blockchainManager.getFileVerification(fileId)
        if (!blockchainVerification || blockchainVerification.verificationInfo != 'success') {
          logger.error(`File ${fileId} not verified.`)
          GlobalValueManager.sendNotice(`File not verified by server. Download abort.`, 'error')
          return
        }
        logger.info(`File ${fileId} is verified.`)

        const proxied = response.fileInfo.ownerId !== response.fileInfo.originOwnerId

        // Get blockchain verification and file information
        const blockchainFileInfo = await this.blockchainManager.getFileInfo(fileId)
        logger.debug(blockchainFileInfo)
        if (!blockchainFileInfo) {
          logger.error(`File ${fileId} info not on blockchain.`)
          GlobalValueManager.sendNotice(`File info not on blockchain. Download abort.`, 'error')
          return
        }

        const { id, name, cipher, spk, size } = response.fileInfo
        this.downloadFileProcess2(id, name, cipher, spk, size, proxied, blockchainFileInfo)
      } catch (error) {
        logger.error(error)
        GlobalValueManager.sendNotice(`Failed to download file.`, 'error')
      }
    })
  }

  async downloadFileProcess2(fileId, filename, cipher, spk, size, proxied, blockchainFileInfo) {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog({
        defaultPath: filename,
        properties: ['showOverwriteConfirmation', 'createDirectory']
      })
      if (canceled) {
        logger.info('Download canceled.')
        GlobalValueManager.sendNotice('Download canceled.', 'error')
        return
      }

      const writeStream = createWriteStream(filePath)
      let writeCompleteResolve, writeCompleteReject
      const writeCompletePromise = new Promise((resolve, reject) => {
        writeCompleteResolve = resolve
        writeCompleteReject = reject
      })
      writeStream.on('error', (err) => {
        logger.error(`Failed to write file ${filename}: ${err}. Download aborted.`)
        GlobalValueManager.sendNotice('Failed to download file', 'error')
        try {
          unlink(filePath)
        } catch (error) {
          if (error.code !== 'ENOENT') {
            logger.error(error)
          }
        } finally {
          writeCompleteReject()
        }
      })
      writeStream.on('finish', () => {
        logger.info(`Downloaded file ${filename} to ${filePath}`)
        // GlobalValueManager.sendNotice('Success to download file', 'success')
        writeCompleteResolve()
      })
      const decipher = await this.aesModule.decrypt(cipher, spk, proxied)
      logger.info(
        `Downloading file ${fileId} with protocol ${GlobalValueManager.serverConfig.protocol}...`
      )
      // download progress
      const pipeProgress = createPipeProgress({ total: size }, logger)

      this.aesModule.makeHash(pipeProgress, async (digest) => {
        try {
          await writeCompletePromise
        } catch (error) {
          // Write failed. Do nothing.
          return
        }
        if (BigInt(digest) != BigInt(blockchainFileInfo.fileHash)) {
          logger.debug({
            fileHash: BigInt(digest),
            blockchainHash: BigInt(blockchainFileInfo.fileHash)
          })
          logger.error(`File hash did not meet for file ${fileId}`)
          GlobalValueManager.sendNotice('Failed to download file', 'error')
          socket.emit('download-file-hash-error', {
            fileId,
            fileHash: BigInt(digest),
            blockchainHash: BigInt(blockchainFileInfo.fileHash)
          })
          try {
            await unlink(filePath)
          } catch (error) {
            if (error.code !== 'ENOENT') {
              logger.error(error)
            }
          }
          return
        }
        logger.info(`File hash verified for file ${fileId}.`)
        GlobalValueManager.sendNotice('Success to download file', 'success')
      })

      pipeProgress.pipe(decipher)
      decipher.pipe(writeStream)
      if (GlobalValueManager.serverConfig.protocol === 'https') {
        downloadFileProcessHttps(fileId, pipeProgress, filePath)
      } else if (GlobalValueManager.serverConfig.protocol === 'ftps') {
        downloadFileProcessFtps(fileId, pipeProgress, filePath)
      } else {
        throw new Error('Invalid file protocol')
      }
    } catch (error) {
      logger.error(`Failed to download file: ${error}. Download aborted.`)
      GlobalValueManager.sendNotice('Failed to download file', 'error')
    }
  }

  deleteFileProcess(fileId) {
    logger.info(`Asking to delete file ${fileId}...`)
    socket.emit('delete-file', { fileId }, (response) => {
      const { errorMsg } = response
      if (errorMsg) {
        logger.error(`Failed to delete file ${fileId}: ${errorMsg}`)
        GlobalValueManager.sendNotice('Failed to delete file', 'error')
      } else {
        logger.info(`Success to delete file ${fileId}`)
        GlobalValueManager.sendNotice('Success to delete file', 'success')
        this.getFileListProcess(GlobalValueManager.curFolderId)
      }
    })
  }

  addFolderProcess(parentFolderId, folderName) {
    logger.info(`Asking to add folder ${folderName}...`)
    socket.emit('add-folder', { parentFolderId, folderName }, (response) => {
      const { errorMsg } = response
      if (errorMsg) {
        logger.error(`Failed to add folder ${folderName}: ${errorMsg}`)
        GlobalValueManager.sendNotice('Failed to add folder', 'error')
      } else {
        logger.info(`Success to add folder ${folderName}`)
        GlobalValueManager.sendNotice('Success to add folder', 'success')
        this.getFileListProcess(GlobalValueManager.curFolderId)
      }
    })
  }

  deleteFolderProcess(folderId) {
    logger.info(`Asking to delete folder ${folderId}...`)
    socket.emit('delete-folder', { folderId }, (response) => {
      const { errorMsg } = response
      if (errorMsg) {
        logger.error(`Failed to delete folder: ${errorMsg}`)
        GlobalValueManager.sendNotice('Failed to delete folder', 'error')
      } else {
        logger.info(`Success to delete folder ${folderId}`)
        GlobalValueManager.sendNotice('Success to delete folder', 'success')
        this.getFileListProcess(GlobalValueManager.curFolderId)
      }
    })
  }

  getAllFoldersProcess() {
    logger.info('Asking for all folders...')
    return new Promise((resolve) => {
      socket.emit('get-all-folders', (response) => {
        const { folders, errorMsg } = response
        if (errorMsg) {
          logger.error(`Failed to get all folders: ${errorMsg}`)
          GlobalValueManager.sendNotice('Failed to get all folders', 'error')
          resolve(null)
        } else {
          resolve(folders)
        }
      })
    })
  }

  moveFileProcess(fileId, targetFolderId) {
    logger.info(`Asking to move file ${fileId} to ${targetFolderId}...`)
    socket.emit('move-file', { fileId, targetFolderId }, (response) => {
      const { errorMsg } = response
      if (errorMsg) {
        logger.error(`Failed to move file ${fileId} to ${targetFolderId}: ${errorMsg}`)
        GlobalValueManager.sendNotice('Failed to move file', 'error')
      } else {
        logger.info(`Moved file ${fileId} to ${targetFolderId}`)
        GlobalValueManager.sendNotice('Success to move file', 'success')
        this.getFileListProcess(GlobalValueManager.curFolderId)
      }
    })
  }

  getAllPublicFilesProcess() {
    logger.info('Asking for all public files...')
    return new Promise((resolve) => {
      socket.emit('get-public-files', (response) => {
        const { files, errorMsg } = response
        if (errorMsg) {
          logger.error(`Failed to get all public files: ${errorMsg}`)
          GlobalValueManager.sendNotice('Failed to get all public files', 'error')
          resolve(null)
        } else {
          resolve(files)
        }
      })
    })
  }

  updateFileDescPermProcess(fileId, description, permission) {
    logger.info(`Asking to update file ${fileId} description and permission...`)
    socket.emit('update-file-desc-perm', { fileId, description, permission }, (response) => {
      const { errorMsg } = response
      if (errorMsg) {
        logger.error(`Failed to update file ${fileId} description and permission: ${errorMsg}`)
        GlobalValueManager.sendNotice('Failed to update file description and permission', 'error')
      } else {
        logger.info(`Success to update file ${fileId} description and permission`)
        GlobalValueManager.sendNotice(
          'Success to update file description and permission',
          'success'
        )
        this.getFileListProcess(GlobalValueManager.curFolderId)
      }
    })
  }
}

export default FileManager
