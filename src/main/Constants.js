import { join, dirname } from 'node:path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
/**
 * The name of the root directory of the project
 **/
const __dirname = dirname(dirname(dirname(__filename))) // get the name of the directory (this file is in the 'src/main' folder)
const __download_dir = 'downloads'

export { __dirname, __download_dir }
