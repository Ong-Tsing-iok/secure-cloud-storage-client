import { socket } from './MessageManager'
import { createWriteStream, unlink, mkdirSync } from 'node:fs'
import { logger } from './Logger'
import { net } from 'electron'
import FormData from 'form-data'

const uploadFileProcessHttps = (fileStream) => {
  const form = new FormData()
  // form.append('socketId', socket.id)
  form.append('file', fileStream)
  const request = net.request({
    method: 'POST',
    url: 'https://localhost:3001/upload',
    headers: { ...form.getHeaders(), socketid: socket.id } // TODO: maybe change to other one-time token (remember is case insensitive)
  })
  form.pipe(request)

  request.on('response', (response) => {
    logger.info(`STATUS: ${response.statusCode}`)
    logger.info(`HEADERS: ${JSON.stringify(response.headers)}`)

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

const downloadFileProcessHttps = (uuid) => {
  const request = net.request({
    method: 'GET',
    url: `https://localhost:3001/download`,
    headers: { socketid: socket.id, uuid: uuid } // TODO: maybe change to other one-time token (remember is case insensitive)
  })
  request.end()

  request.on('response', (response) => {
    logger.info(`STATUS: ${response.statusCode}`)
    logger.info(`HEADERS: ${JSON.stringify(response.headers)}`)

    var file = null
    if (response.statusCode === 200) {
      const filename = response.headers['content-disposition'].split('=')[1].split('"')[1]
      try {
        mkdirSync('downloads', { recursive: false })
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error
        }
      }

      file = createWriteStream(`downloads/${filename}`)
      file
        .on('finish', () => {
          logger.info('Download finished')
          file.close()
        })
        .on('error', (err) => {
          logger.error(`Error writing file: ${err}`)
          unlink(file.path)
        })
    }
    response.on('data', (chunk) => {
      if (file) {
        file.write(chunk)
      } else {
        logger.info(`BODY: ${chunk}`)
      }
    })

    response.on('end', () => {
      logger.info('No more data in response.')
    })
  })

  request.on('error', (error) => {
    logger.error(`ERROR: ${error.message}`)
  })
}

export { uploadFileProcessHttps, downloadFileProcessHttps }
