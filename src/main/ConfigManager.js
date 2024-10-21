import config from 'config'
// TODO: check overwrite, if not exist then use default
const serverConfig = config.get('server')
const keysConfig = config.get('keys')

export { serverConfig, keysConfig }
