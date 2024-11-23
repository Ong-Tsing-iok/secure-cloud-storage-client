import { PassThrough } from 'node:stream'

const createPipeProgress = (options, logger) => {
  options = options || {}
  if (!options.total) {
    throw new Error('total is required')
  }
  const total = options.total
  let current = 0
  const progress = new PassThrough(options)
  progress.on('data', (chunk) => {
    current += chunk.length
    // logger.info(`Progress: ${current}/${total}`)
  })

  return progress
}

export { createPipeProgress }
