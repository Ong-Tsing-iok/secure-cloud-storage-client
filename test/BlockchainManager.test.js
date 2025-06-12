import { jest, describe, beforeEach, test, expect } from '@jest/globals'
import { JsonRpcProvider, Contract } from 'ethers'
import { logger } from '../src/main/Logger'
import GlobalValueManager from '../src/main/GlobalValueManager'
import BlockchainManager from '../src/main/BlockchainManager' // Assuming BlockchainManager is in BlockchainManager.js or .ts

// Mock the external dependencies
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn(() => ({})), // Mock JsonRpcProvider constructor
  Contract: jest.fn(() => ({
    owner: jest.fn(), // Mock the owner method on the Contract instance
    uploadFile: jest.fn(),
    filters: {},
    queryFilter: jest.fn()
  }))
}))

jest.mock('../src/main/Logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn()
  }
}))

jest.mock('../src/main/GlobalValueManager', () => ({
  blockchain: {
    abi: ['some_abi_definition'],
    jsonRpcUrl: 'http://mock-rpc-url.com',
    contractAddr: '0xmockContractAddress'
  }
}))

describe('BlockchainManager', () => {
  let blockchainManager
  let mockContractInstance

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Re-initialize BlockchainManager for each test
    blockchainManager = new BlockchainManager()

    // Get the mock contract instance that was created by the BlockchainManager constructor
    mockContractInstance = Contract.mock.results[0].value
  })

  describe('constructor', () => {
    test('should initialize JsonRpcProvider and Contract with correct values', () => {
      expect(JsonRpcProvider).toHaveBeenCalledTimes(1)
      expect(JsonRpcProvider).toHaveBeenCalledWith(GlobalValueManager.blockchain.jsonRpcUrl)

      expect(Contract).toHaveBeenCalledTimes(1)
      expect(Contract).toHaveBeenCalledWith(
        GlobalValueManager.blockchain.contractAddr,
        GlobalValueManager.blockchain.abi,
        expect.any(Object) // The provider instance
      )
    })

    test('should set the contract property', () => {
      expect(blockchainManager.contract).toBeDefined()
      expect(blockchainManager.contract).toBe(mockContractInstance)
    })

    // TODO: Test for connection error in constructor
    // This would typically involve mocking the JsonRpcProvider constructor to throw an error,
    // and then asserting that the catch block in the BlockchainManager handles it.
    // However, given the current code, there isn't a direct catch for connection errors in the constructor.
    // If you add a try-catch, you can test it like this:
    /*
    test('should log error if JsonRpcProvider fails to connect', () => {
      JsonRpcProvider.mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });
      // Depending on how you handle it, you might expect logger.error to be called
      // or the constructor to throw, which you would then catch in the test.
      expect(() => new BlockchainManager()).toThrow('Connection failed'); // If you re-throw
      // OR
      // expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Connection failed')); // If you log
    });
    */
  })

  describe('printContractOwner', () => {
    test('should call contract.owner() and log the result', async () => {
      const mockOwnerAddress = '0xmockOwnerAddress123'
      mockContractInstance.owner.mockResolvedValueOnce(mockOwnerAddress)

      await blockchainManager.printContractOwner()

      expect(mockContractInstance.owner).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(`The owner of contract is ${mockOwnerAddress}`)
    })
  })

  describe('uploadFileInfo', () => {
    let mockTx

    beforeEach(() => {
      mockTx = { wait: jest.fn() }
      mockContractInstance.uploadFile = jest.fn().mockResolvedValue(mockTx)
    })

    test('should convert fileId and fileHash to BigInt and log debug info', async () => {
      const fileId = 123
      const fileHash = '456'
      const metadata = 'some-metadata'

      await blockchainManager.uploadFileInfo(fileId, fileHash, metadata)

      expect(logger.debug).toHaveBeenCalledTimes(1)
      expect(logger.debug).toHaveBeenCalledWith(
        `upload fileInfo with bfileId: ${BigInt(fileId)}, bfileHash: ${BigInt(fileHash)}, metadata: ${metadata}`
      )
    })

    test('should log success message after "upload"', async () => {
      const fileId = 789
      const fileHash = '1011'
      const metadata = 'other-metadata'

      await blockchainManager.uploadFileInfo(fileId, fileHash, metadata)

      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(
        `fileInfo of Id ${fileId} uploaded to blockchain successfully`
      )
    })

    test('should call contract.uploadFile with correct arguments', async () => {
      const fileId = 1
      const fileHash = '2'
      const metadata = 'test-metadata'
      // Mock the upload method on your mock contract instance

      await blockchainManager.uploadFileInfo(fileId, fileHash, metadata)

      expect(mockContractInstance.uploadFile).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.uploadFile).toHaveBeenCalledWith(
        BigInt(fileId),
        BigInt(fileHash),
        metadata
      )
      expect(mockTx.wait).toHaveBeenCalledTimes(1)
    })
  })

  describe('getFileInfo', () => {
    const fileUploadRecord = {
      args: {
        fileId: BigInt('0x124'),
        fileHash: BigInt(0x456),
        metadata: 'file_metadata',
        uploader: BigInt('0x789'),
        timestamp: BigInt('0x486787')
      }
    }
    let result
    beforeEach(async () => {
      mockContractInstance.filters.FileUploaded = jest.fn().mockReturnValueOnce({})
      mockContractInstance.queryFilter.mockResolvedValueOnce([fileUploadRecord])
      result = await blockchainManager.getFileInfo(
        fileUploadRecord.args.fileId,
        fileUploadRecord.args.uploader
      )
    })

    test('should call contract.filters.FileUploaded with correct arguments', () => {
      expect(mockContractInstance.filters.FileUploaded).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.filters.FileUploaded).toHaveBeenCalledWith(
        fileUploadRecord.args.fileId,
        fileUploadRecord.args.uploader
      )
    })

    test('should call contract.queryFilter with return value from contract.filters.FileUploaded', () => {
      expect(mockContractInstance.queryFilter).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.queryFilter).toHaveBeenCalledWith(expect.any(Object))
    })

    test('should return correct result', () => {
      expect(result).toEqual(fileUploadRecord)
    })

    test('should return null if contract.queryFilter return empty array', async () => {
      mockContractInstance.queryFilter.mockResolvedValueOnce([])
      result = await blockchainManager.getFileInfo(
        fileUploadRecord.args.fileId,
        fileUploadRecord.args.uploader
      )

      expect(result).toEqual(null)
    })

    test('should log success message', () => {
      expect(logger.info).toHaveBeenCalledTimes(1)
    })
  })

  describe('getFileVerification', () => {
    const fileVerificationRecord = {
      args: {
        fileId: BigInt('0x124'),
        uploader: BigInt('0x78843'),
        verificationInfo: 'file_metadata',
        verifier: BigInt('0x789'),
        timestamp: BigInt('0x486787')
      }
    }
    let result
    beforeEach(async () => {
      mockContractInstance.filters.FileVerified = jest.fn().mockReturnValueOnce({})
      mockContractInstance.queryFilter.mockResolvedValueOnce([fileVerificationRecord])
      result = await blockchainManager.getFileVerification(
        fileVerificationRecord.args.fileId,
        fileVerificationRecord.args.uploader
      )
    })

    test('should call contract.filters.FileVerified with correct arguments', () => {
      expect(mockContractInstance.filters.FileVerified).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.filters.FileVerified).toHaveBeenCalledWith(
        fileVerificationRecord.args.fileId,
        fileVerificationRecord.args.uploader
      )
    })

    test('should call contract.queryFilter with return value from contract.filters.FileVerified', () => {
      expect(mockContractInstance.queryFilter).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.queryFilter).toHaveBeenCalledWith(expect.any(Object))
    })

    test('should return correct result', () => {
      expect(result).toEqual(fileVerificationRecord)
    })

    test('should return null if contract.queryFilter return empty array', async () => {
      mockContractInstance.queryFilter.mockResolvedValueOnce([])
      result = await blockchainManager.getFileVerification(
        fileVerificationRecord.args.fileId,
        fileVerificationRecord.args.uploader
      )

      expect(result).toEqual(null)
    })

    test('should log success message', () => {
      expect(logger.info).toHaveBeenCalledTimes(1)
    })
  })

  describe('getFileAuthRecord', () => {
    const fileAuthRecord = {
      args: {
        fileId: BigInt('0x124'),
        requestor: BigInt('0x78843'),
        authorizationInfo: 'auth_info',
        authorizer: BigInt('0x789'),
        verifier: BigInt('0x7874589'),
        timestamp: BigInt('0x486787')
      }
    }
    let result
    beforeEach(async () => {
      mockContractInstance.filters.FileAuthorizationAdded = jest.fn().mockReturnValueOnce({})
      mockContractInstance.queryFilter.mockResolvedValueOnce([fileAuthRecord])
      result = await blockchainManager.getFileAuthRecord(
        fileAuthRecord.args.fileId,
        fileAuthRecord.args.requestor
      )
    })

    test('should call contract.filters.FileAuthorizationAdded with correct arguments', () => {
      expect(mockContractInstance.filters.FileAuthorizationAdded).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.filters.FileAuthorizationAdded).toHaveBeenCalledWith(
        fileAuthRecord.args.fileId,
        fileAuthRecord.args.requestor
      )
    })

    test('should call contract.queryFilter with return value from contract.filters.FileAuthorizationAdded', () => {
      expect(mockContractInstance.queryFilter).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.queryFilter).toHaveBeenCalledWith(expect.any(Object))
    })

    test('should return correct result', () => {
      expect(result).toEqual(fileAuthRecord)
    })

    test('should return null if contract.queryFilter return empty array', async () => {
      mockContractInstance.queryFilter.mockResolvedValueOnce([])
      result = await blockchainManager.getFileAuthRecord(
        fileAuthRecord.args.fileId,
        fileAuthRecord.args.requestor
      )

      expect(result).toEqual(null)
    })

    test('should log success message', () => {
      expect(logger.info).toHaveBeenCalledTimes(1)
    })
  })
})
