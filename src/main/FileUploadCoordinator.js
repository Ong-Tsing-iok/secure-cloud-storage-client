import { logger } from './Logger'
import BlockchainManager from './BlockchainManager'
import GlobalValueManager from './GlobalValueManager'

// Maybe choose a better name...
export default class FileUploadCoordinator {
  #resolveReadyPromise
  /**
   *
   * @param {BlockchainManager} blockchainManager
   * @param {string} fileId
   * @param {string} metadata
   */
  constructor(blockchainManager, fileId, metadata) {
    this.blockchainManager = blockchainManager
    this.uploadFinished = false
    this.hashFinished = false
    this.uploadInstantiated = false

    this.fileId = fileId.replaceAll('-', '')
    this.metadata = metadata

    this.readyPromise = new Promise((resolve) => {
      this.#resolveReadyPromise = resolve
    })
  }

  finishUpload() {
    this.uploadFinished = true
    this.#checkReady()
  }

  /**
   *
   * @param {string} digest sha256 hash in hex format
   */
  finishHash(digest) {
    this.hashFinished = true
    this.digest = digest
    this.#checkReady()
  }

  #checkReady() {
    if (this.uploadFinished && this.hashFinished && !this.uploadInstantiated) {
      this.uploadInstantiated = true
      this.#resolveReadyPromise()
    }
  }

  /**
   * Will throw error.
   */
  async uploadToBlockchainWhenReady() {
    await this.readyPromise
    await this.blockchainManager.uploadFileInfo(this.fileId, this.digest, this.metadata)
  }
}
