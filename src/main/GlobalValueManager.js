import config from 'config'
import { logger } from './Logger'
// TODO: check overwrite, if not exist then use default
class GlobalValueManager {
  constructor() {
    // TODO: first check if exist
    // TODO: if not exist, create
    try {
      this.serverConfig = config.get('server')
      this.keysConfig = config.get('keys')
    } catch (error) {
      logger.error(`Failed to load config: ${error}`)
    }

    // global values
    this.mainWindow = null
    this.curFolderId = null
    this.userId = null
  }
}

export default new GlobalValueManager()
