import config from 'config'
import { logger } from './Logger'
import { writeFileSync, readFileSync } from 'node:original-fs'
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
    } catch (error) {
      logger.error(`Failed to load config: ${error}`)
    }

    // global values
    this.mainWindow = null
    this.curFolderId = null
    this.userId = null
    logger.info('Global value manager initialized')
  }

  updateConfig(field, value) {
    try {
      const current = JSON.parse(readFileSync('./config/local.json'))
      current[field] = value
      writeFileSync('./config/local.json', JSON.stringify(current, null, 2))
      // config.set(field, value)
    } catch (error) {
      logger.error(`Failed to update config: ${error}`)
    }
  }

  updateUser(user) {
    const wrapper = { user }
    try {
      this.updateConfig('user', user)
      this.userConfig = config.get('user')
      this.mainWindow?.webContents.send('notice', 'Success to update user info', 'success')
    } catch (error) {
      logger.error(`Failed to update user: ${error}`)
      this.mainWindow?.webContents.send('notice', 'Failed to update user info', 'error')
    }
  }
}

export default new GlobalValueManager()
