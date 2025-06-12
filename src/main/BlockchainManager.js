import { JsonRpcProvider, Contract } from 'ethers'
import { logger } from './Logger'
import GlobalValueManager from './GlobalValueManager'

/**
 * Manages smart contract communication
 */
class BlockchainManager {
  /**
   * Connect to blockchain and smart contract
   */
  constructor() {
    try {
      const abi = GlobalValueManager.blockchain.abi
      const url = GlobalValueManager.blockchain.jsonRpcUrl
      const contractAddr = GlobalValueManager.blockchain.contractAddr
      const provider = new JsonRpcProvider(url)
      this.contract = new Contract(contractAddr, abi, provider)
    } catch (error) {
      logger.error(error)
    }
  }

  async printContractOwner() {
    logger.info(`The owner of contract is ${await this.contract.owner()}`)
  }

  // Error should be handled by the layer above
  /**
   * Upload file hash and metadata to blockchain
   * @param {string | BigInt} fileId UUID of the file
   * @param {string | BigInt} fileHash sha256 hash of the file
   * @param {string} metadata file metadata in JSON format
   */
  async uploadFileInfo(fileId, fileHash, metadata) {
    const bFileId = BigInt(fileId)
    const bFileHash = BigInt(fileHash)
    // Do upload
    const tx = await this.contract.uploadFile(bFileId, bFileHash, metadata)
    await tx.wait()
    logger.debug(
      `upload fileInfo with bfileId: ${bFileId}, bfileHash: ${bFileHash}, metadata: ${metadata}`
    )
    logger.info(`fileInfo of Id ${fileId} uploaded to blockchain successfully`)
  }

  /**
   * Get hash and metadata of a file
   * @param {string | BigInt} fileId UUID of the file
   * @param {string | BigInt} uploader Blockchain address of the file owner
   * @returns First event log queried or null if not found
   */
  async getFileInfo(fileId, uploader) {
    const events = await this.contract.queryFilter(
      this.contract.filters.FileUploaded(BigInt(fileId), BigInt(uploader))
    )
    logger.info(`retrived fileInfo for fileId ${fileId}`)
    if (events.length == 0) {
      return null
    } else {
      return events[0]
    }
  }

  /**
   * Get verification information of a file
   * @param {string | Bigint} fileId UUID of the file
   * @param {string | Bigint} uploader Blockchain address of the file owner
   * @returns First event log queried or null if not found
   */
  async getFileVerification(fileId, uploader) {
    const events = await this.contract.queryFilter(
      this.contract.filters.FileVerified(BigInt(fileId), BigInt(uploader))
    )
    logger.info(`retrieved file verification info for fileId ${fileId}`)
    if (events.length == 0) {
      return null
    } else {
      return events[0]
    }
  }

  /**
   * Get authentication records of a file
   * @param {string | Bigint} fileId UUID of the file
   * @param {string | Bigint} requestor Blockchain address of the requestor
   * @returns First event log queried or null if not found
   */
  async getFileAuthRecord(fileId, requestor) {
    const events = await this.contract.queryFilter(
      this.contract.filters.FileAuthorizationAdded(BigInt(fileId), BigInt(requestor))
    )
    logger.info(`retrieved file auth record for fileId ${fileId}`)
    if (events.length == 0) {
      return null
    } else {
      return events[0]
    }
  }
}

// const blockchainManager = new BlockchainManager()
// blockchainManager.printContractOwner().catch((error) => logger.error(error))
// blockchainManager
//   .uploadFileInfo('0x552', '0x899', 'this is a file')
//   .catch((error) => logger.error(error))

export default BlockchainManager
