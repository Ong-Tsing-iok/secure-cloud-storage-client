import config from 'config'
import { logger } from './Logger'
import { writeFileSync, readFileSync } from 'node:original-fs'
import { join } from 'node:path'
// import Store from 'electron-store'
// export const store = new Store({
//   seenRequest: {
//     type: 'number',
//     default: 0
//   },
//   seenReply: {
//     type: 'number',
//     default: 0
//   }
// })
// TODO: check overwrite, if not exist then use default
// TODO: maybe need to set config path?
class GlobalValueManager {
  constructor() {
    // TODO: first check if exist
    // TODO: if not exist, create
    try {
      this.serverConfig = config.get('server')
      this.keysConfig = config.get('keys')
      this.userConfig = config.get('user')
      this.directoryConfig = config.get('directories')
      this.requestConfig = config.get('request')
      this.userListConfig = config.get('userList')
    } catch (error) {
      logger.error(`Failed to load config: ${error}`)
    }

    // global values
    this.mainWindow = null
    this.curFolderId = null
    this.userId = null
    logger.info('Global value manager initialized')
  }

  get downloadDir() {
    return this.directoryConfig.downloads
  }

  get httpsUrl() {
    return `https://${this.serverConfig.host}:${this.serverConfig.port.https}`
  }

  updateConfig(field, value) {
    try {
      const filename = `./config/local-${process.env.NODE_APP_INSTANCE}.json`
      console.log(filename)
      const current = JSON.parse(readFileSync(filename))
      current[field] = value
      writeFileSync(filename, JSON.stringify(current, null, 2))
      // config.set(field, value)
    } catch (error) {
      logger.error(`Failed to update config: ${error}`)
    }
  }

  updateUser(user) {
    try {
      this.updateConfig('user', user)
      this.userConfig = config.get('user')
      this.mainWindow?.webContents.send('notice', 'Success to update user info', 'success')
    } catch (error) {
      logger.error(`Failed to update user: ${error}`)
      this.mainWindow?.webContents.send('notice', 'Failed to update user info', 'error')
    }
  }

  updateUserList(users) {
    try {
      this.updateConfig('userList', users)
      this.userListConfig = config.get('userList')
      // this.mainWindow?.webContents.send('notice', 'Success to update user list', 'success')
    } catch (error) {
      logger.error(`Failed to update user list: ${error}`)
      // this.mainWindow?.webContents.send('notice', 'Failed to update user list', 'error')
    }
  }

  updateRequest(req) {
    try {
      this.updateConfig('request', req)
      this.requestConfig = config.get('request')
      // this.mainWindow?.webContents.send('notice', 'Success to update request info', 'success')
    } catch (error) {
      logger.error(`Failed to update request: ${error}`)
      // this.mainWindow?.webContents.send('notice', 'Failed to update request info', 'error')
    }
  }
}

export default new GlobalValueManager()
