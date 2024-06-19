import { dialog } from 'electron'
import { socket } from './MessageManager'
import { basename } from 'node:path'
import { readFile, createReadStream } from 'node:fs'
import { logger } from './Logger'
import { net } from 'electron'
import FormData from 'form-data'

const uploadFileProcess = async () => {
  logger.info('Browsing file...')
  // TODO: may need to store and use main window id
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if (filePaths.length > 0) {
    const filePath = filePaths[0]
    const form = new FormData()
    form.append('socketId', socket.id)
    form.append('file', createReadStream(filePath))
    const request = net.request({
      method: 'POST',
      url: 'https://localhost:3001/upload',
      headers: form.getHeaders()
    })
    form.pipe(request)
    // Read the file and send it over the socket
    // readFile(filePath, (err, data) => {
    //   if (err) {
    //     logger.error(`Error reading file ${filePath}: ${err}`)
    //     return
    //   }
    //   // TODO: may need to split into chunks
    //   net.request({ method: 'POST', url: 'https://localhost:3001/upload' }).end(data)
    //   socket.emit('file-upload', { fileName: basename(filePath), fileData: data }, (response) => {
    //     logger.info(`File upload response: ${response}`)
    //   })
    //   logger.info(`File sent: ${filePath}`)
    // })
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
}

export { uploadFileProcess }
