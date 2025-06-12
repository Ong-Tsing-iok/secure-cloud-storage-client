import { JsonRpcProvider, Contract } from 'ethers'
import { logger } from './Logger'

class BlockchainManager {
  constructor() {
    const abi = []
    const url = ''
    const contractAddress = ''
    const provider = new JsonRpcProvider(url)
    // TODO: catch connection error
    this.contract = new Contract(contractAddress, abi, provider)
  }

  async printContractOwner() {
    logger.info(`The owner of contract is ${await this.contract.owner()}`)
  }
}

const blockchainManager = new BlockchainManager()
blockchainManager.printContractOwner().catch((error) => logger.error(error))

export default BlockchainManager
