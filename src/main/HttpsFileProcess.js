import { socket } from './MessageManager'
import { createWriteStream, unlink, mkdirSync } from 'node:fs'
import { logger } from './Logger'
import { net } from 'electron'
import FormData from 'form-data'
import { basename } from 'node:path'

const uploadFileProcessHttps = (fileStream, filePath) => {
  const form = new FormData()
  // form.append('socketId', socket.id)
  form.append('file', fileStream, basename(filePath))
  const request = net.request({
    method: 'POST',
    url: 'https://localhost:3001/upload',
    // url: 'https://ba96fc54-6a51-49c9-bba0-bc1060e0dd24.mock.pstmn.io/upload',
    headers: { ...form.getHeaders(), socketid: socket.id } // TODO: maybe change to other one-time token (remember is case insensitive)
  })
  form.pipe(request)
  request.on('response', (response) => {
    logger.info(`STATUS: ${response.statusCode}`)
    logger.info(`HEADERS: ${JSON.stringify(response.headers)}`)
    console.log(`upload end: ${Date.now()}`)
    response.on('data', (chunk) => {
      logger.info(`BODY: ${chunk}`)
    })

    response.on('end', () => {
      logger.info('No more data in response.')
    })
  })

  request.on('error', (error) => {
    logger.error(`ERROR: ${error.message}`)
  })
}

const downloadFileProcessHttps = (uuid, writeStream, filePath) => {
  const request = net.request({
    method: 'GET',
    url: `https://localhost:3001/download`,
    headers: { socketid: socket.id, uuid: uuid } // TODO: maybe change to other one-time token (remember is case insensitive)
  })
  request.end()

  request.on('response', (response) => {
    logger.info(`STATUS: ${response.statusCode}`)
    logger.info(`HEADERS: ${JSON.stringify(response.headers)}`)

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
  })
}

export { uploadFileProcessHttps, downloadFileProcessHttps }
