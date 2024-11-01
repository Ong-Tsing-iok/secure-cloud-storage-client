import winston from 'winston'
import ScreenTransport from './ScreenTransport'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  // defaultMeta: { service: 'user-service' },
  transports:
    process.env.NODE_ENV === 'test'
      ? []
      : [
          //
          // - Write all logs with importance level of `error` or less to `error.log`
          // - Write all logs with importance level of `info` or less to `combined.log`
          //
          new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            format: winston.format.timestamp()
          }),
          new winston.transports.File({
            filename: 'combined.log',
            format: winston.format.timestamp()
          }),
          new ScreenTransport()
        ]
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'debug'
    })
  )
}

// export function logger {
//   return logger
// }

export { logger }
