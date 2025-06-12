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
}

const blockchainManager = new BlockchainManager()
blockchainManager.printContractOwner().catch((error) => logger.error(error))

export default BlockchainManager
