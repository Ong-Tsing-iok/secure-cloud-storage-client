import { socket } from './MessageManager'
import { statSync } from 'node:fs'
import { logger } from './Logger'
import { net } from 'electron'
import FormData from 'form-data'
import { basename } from 'node:path'
import GlobalValueManager from './GlobalValueManager'
import { createPipeProgress } from './util/PipeProgress'
import { getFileListProcess } from './FileManager'

const uploadFileProcessHttps = (fileStream, filePath, uploadId) => {
  const form = new FormData()
  // form.append('socketId', socket.id)
  form.append('file', fileStream, basename(filePath))
  const request = net.request({
    method: 'POST',
    url: `${GlobalValueManager.httpsUrl}/upload`,
    headers: { ...form.getHeaders(), socketid: socket.id, uploadid: uploadId } // TODO: maybe change to other one-time token (remember is case insensitive)
  })
  request.chunkedEncoding = true

  // const PipeProgress = createPipeProgress({ total: statSync(filePath).size }, logger)
  // form.pipe(PipeProgress)
  // PipeProgress.pipe(request)

  form.pipe(request)

  request.on('response', (response) => {
    logger.info(`STATUS: ${response.statusCode}`)
    // logger.info(`HEADERS: ${JSON.stringify(response.headers)}`)
    // console.log(`upload end: ${Date.now()}`)
    response.on('data', (chunk) => {
      logger.info(`BODY: ${chunk}`)
    })

    response.on('end', () => {
      // logger.info('No more data in response.')
      if (response.statusCode === 200) {
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Upload succeeded', 'success')
        getFileListProcess(GlobalValueManager.curFolderId)
      } else {
        GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to upload file', 'error')
      }
    })
  })

  request.on('error', (error) => {
    logger.error(`ERROR: ${error.message}`)
    GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to upload file', 'error')
  })
}

const downloadFileProcessHttps = (uuid, writeStream, filePath) => {
  const request = net.request({
    method: 'GET',
    url: `${GlobalValueManager.httpsUrl}/download`,
    headers: { socketid: socket.id, uuid: uuid } // TODO: maybe change to other one-time token (remember is case insensitive)
  })
  request.end()

  request.on('response', (response) => {
    logger.info(`STATUS: ${response.statusCode}`)
    // logger.info(`HEADERS: ${JSON.stringify(response.headers)}`)

    response.on('data', (chunk) => {
      if (response.statusCode === 200) {
        writeStream.write(chunk)
      } else {
        logger.info(`BODY: ${chunk}`)
      }
    })

    response.on('end', () => {
      logger.info('No more data in response.')
      writeStream.end()
    })
  })

  request.on('error', (error) => {
    logger.error(`ERROR: ${error.message}`)
    GlobalValueManager.mainWindow?.webContents.send('notice', 'Failed to download file', 'error')
  })
}

export { uploadFileProcessHttps, downloadFileProcessHttps }
