import { logger } from './Logger'
import { writeFileSync, readFileSync } from 'node:original-fs'
import path, { join, dirname } from 'node:path'
import { app } from 'electron'
import { mkdirSync } from 'node:fs'

const exeDir = dirname(app.getPath('exe'))
process.env['NODE_CONFIG_DIR'] =
  `${app.getAppPath()}/config${path.delimiter}${path.join(exeDir, 'config')}`
const config = require('config')
// TODO: check overwrite, if not exist then use default
// TODO: maybe need to set config path?
class GlobalValueManager {
  constructor() {
    // TODO: first check if exist
    // TODO: if not exist, create
    // TODO: use has to check if exist?
    try {
      this.serverConfig = config.server
      this.keysConfig = config.get('keys')
      this.userConfig = config.get('user')
      this.directoryConfig = config.get('directories')
      this.requestConfig = config.request
      this.userListConfig = config.userList
    } catch (error) {
      logger.error(`Failed to load config: ${error}`)
    }

    // global values
    this.mainWindow = null
    this.curFolderId = null
    this.userInfo = null
    this.loggedIn = false
    logger.info('Global value manager initialized')
  }

  get cryptoPath() {
    return `${__dirname}/py/crypto`
  }

  get downloadDir() {
    return this.directoryConfig.downloads
  }

  get httpsUrl() {
    return `https://${this.serverConfig.host}:${this.serverConfig.port.https}`
  }

  get userId() {
    if (this.userInfo) {
      return this.userInfo.userId
    }
    return null
  }

  updateConfigFile(field, value) {
    try {
      // const appNum = process.env.NODE_APP_INSTANCE ? `-${process.env.NODE_APP_INSTANCE}` : ''
      const filepath = join('config', `${process.env.NODE_ENV}.json`)
      // console.log(filepath)
      let configStr = '{}'
      try {
        configStr = readFileSync(filepath)
      } catch (error) {
        if (error.code === 'ENOENT') {
          mkdirSync(dirname(filepath), { recursive: true })
          writeFileSync(filepath, JSON.stringify({}, null, 2))
        } else {
          throw error
        }
      }

      const current = JSON.parse(configStr)

      current[field] = value
      writeFileSync(filepath, JSON.stringify(current, null, 2))
      // config.set(field, value)
    } catch (error) {
      logger.error(`Failed to update config: ${error}`)
    }
  }

  updateUser(user) {
    try {
      this.updateConfigFile('user', user)
      this.userConfig = config.get('user')
      this.mainWindow?.webContents.send('notice', 'Success to update user info', 'success')
    } catch (error) {
      logger.error(`Failed to update user: ${error}`)
      this.mainWindow?.webContents.send('notice', 'Failed to update user info', 'error')
    }
  }

  updateUserList(users) {
    //? Maybe should handle checks here
    try {
      this.updateConfigFile('userList', users)
      this.userListConfig = users
      console.log(this.userListConfig)
      // this.mainWindow?.webContents.send('notice', 'Success to update user list', 'success')
    } catch (error) {
      logger.error(`Failed to update user list: ${error}`)
      // this.mainWindow?.webContents.send('notice', 'Failed to update user list', 'error')
    }
  }

  updateRequest(req) {
    try {
      this.updateConfigFile('request', req)
      this.requestConfig = req
      // this.mainWindow?.webContents.send('notice', 'Success to update request info', 'success')
    } catch (error) {
      logger.error(`Failed to update request: ${error}`)
      // this.mainWindow?.webContents.send('notice', 'Failed to update request info', 'error')
    }
  }
}

export default new GlobalValueManager()
