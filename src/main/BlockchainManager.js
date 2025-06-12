import { JsonRpcProvider, Contract } from 'ethers'
import { logger } from './Logger'
import GlobalValueManager from './GlobalValueManager'

class BlockchainManager {
  constructor() {
    const abi = GlobalValueManager.blockchain.abi
    const url = GlobalValueManager.blockchain.jsonRpcUrl
    const contractAddr = GlobalValueManager.blockchain.contractAddr
    const provider = new JsonRpcProvider(url)
    // TODO: catch connection error
    this.contract = new Contract(contractAddr, abi, provider)
  }

  async printContractOwner() {
    logger.info(`The owner of contract is ${await this.contract.owner()}`)
  }

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

  async getFileInfo(fileId, uploader) {
    const events = await this.contract.queryFilter(
      this.contract.filters.FileUploaded(fileId, uploader)
    )
    logger.info(`retrived fileInfo for fileId ${fileId}`)
    if (events.length == 0) {
      return null
    } else {
      return events[0]
    }
  }

  async getFileVerification(fileId, uploader) {
    const events = await this.contract.queryFilter(
      this.contract.filters.FileVerified(fileId, uploader)
    )
    logger.info(`retrieved file verification info for fileId ${fileId}`)
    if (events.length == 0) {
      return null
    } else {
      return events[0]
    }
  }

  async getFileAuthRecord(fileId, requester) {
    const events = await this.contract.queryFilter(
      this.contract.filters.FileAuthorizationAdded(fileId, requester)
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
