import { jest, describe, beforeEach, test, expect } from '@jest/globals'
import { JsonRpcProvider, Contract, Wallet } from 'ethers'
import { readFileSync, writeFileSync } from 'node:fs'
import { logger } from '../src/main/Logger'
import GlobalValueManager from '../src/main/GlobalValueManager'
import BlockchainManager from '../src/main/BlockchainManager' // Assuming BlockchainManager is in BlockchainManager.js or .ts

// Mock the external dependencies
const mockProvider = {}
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn(() => mockProvider), // Mock JsonRpcProvider constructor
  Contract: jest.fn(() => ({
    owner: jest.fn(), // Mock the owner method on the Contract instance
    uploadFile: jest.fn(),
    filters: {},
    queryFilter: jest.fn()
  })),
  Wallet: jest.fn()
}))
jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}))
jest.mock('../src/main/Logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
}))
jest.mock('../src/main/GlobalValueManager', () => ({
  blockchain: {
    abi: ['some_abi_definition'],
    jsonRpcUrl: 'http://mock-rpc-url.com',
    contractAddr: '0xmockContractAddress',
    walletKeyPath: '/some/path'
  }
}))

describe('BlockchainManager', () => {
  const mockWallet = { privateKey: '0x7893157677' }
  let blockchainManager
  let mockContractInstance
  let readOrCreateWalletSpy

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    readOrCreateWalletSpy = jest
      .spyOn(BlockchainManager.prototype, 'readOrCreateWallet')
      .mockReturnValueOnce(mockWallet)
    // Re-initialize BlockchainManager for each test
    blockchainManager = new BlockchainManager()

    // Get the mock contract instance that was created by the BlockchainManager constructor
    mockContractInstance = Contract.mock.results[0].value
  })

  describe('constructor', () => {
    test('should initialize JsonRpcProvider and Contract with correct values', () => {
      expect(JsonRpcProvider).toHaveBeenCalledTimes(1)
      expect(JsonRpcProvider).toHaveBeenCalledWith(GlobalValueManager.blockchain.jsonRpcUrl)
      expect(readOrCreateWalletSpy).toHaveBeenCalledTimes(1)
      expect(readOrCreateWalletSpy).toHaveBeenCalledWith(
        GlobalValueManager.blockchain.walletKeyPath,
        mockProvider
      )
      expect(Contract).toHaveBeenCalledTimes(1)
      expect(Contract).toHaveBeenCalledWith(
        GlobalValueManager.blockchain.contractAddr,
        GlobalValueManager.blockchain.abi,
        mockWallet
      )
    })
    test('should set the contract property', () => {
      expect(blockchainManager.contract).toBeDefined()
      expect(blockchainManager.contract).toBe(mockContractInstance)
    })
    test('should log error if JsonRpcProvider fails to connect', () => {
      JsonRpcProvider.mockImplementationOnce(() => {
        throw new Error('Connection failed')
      })

      blockchainManager = new BlockchainManager()
      // Depending on how you handle it, you might expect logger.error to be called
      // or the constructor to throw, which you would then catch in the test.
      // expect(() => new BlockchainManager()).toThrow('Connection failed') // If you re-throw
      // OR
      expect(logger.error).toHaveBeenCalledWith(new Error('Connection failed')) // If you log
    })
  })

  describe('readOrCreateWallet', () => {
    const somePath = '/this/is/some/path'
    const someWalletKey = '0x8754697845\n\n'

    beforeEach(() => {
      Wallet.mockReturnValueOnce(mockWallet)
      readFileSync.mockReturnValueOnce(someWalletKey)
    })

    test('should read key and create wallet if file exists', () => {
      const result = blockchainManager.readOrCreateWallet(somePath, mockProvider)
      expect(readFileSync).toHaveBeenCalledTimes(1)
      expect(readFileSync).toHaveBeenCalledWith(somePath, 'utf-8')
      expect(Wallet).toHaveBeenCalledTimes(1)
      expect(Wallet).toHaveBeenCalledWith(someWalletKey.trim(), mockProvider)
      expect(result).toBe(mockWallet)
    })
    test('should create wallet and write key if file do not exist', () => {
      readFileSync.mockReset()
      readFileSync.mockImplementationOnce(() => {
        const err = new Error('File not found')
        err.code = 'ENOENT'
        throw err
      })
      Wallet.createRandom = jest.fn().mockReturnValueOnce(mockWallet)
      const result = blockchainManager.readOrCreateWallet(somePath, mockProvider)
      expect(Wallet.createRandom).toHaveBeenCalledTimes(1)
      expect(Wallet.createRandom).toHaveBeenCalledWith(mockProvider)
      expect(writeFileSync).toHaveBeenCalledTimes(1)
      expect(writeFileSync).toHaveBeenCalledWith(somePath, mockWallet.privateKey)
      expect(result).toBe(mockWallet)
    })
    test('should throw error when unexpected error occurs', () => {
      Wallet.mockReset()
      Wallet.mockImplementationOnce(() => {
        throw new Error('Unexpected')
      })
      expect(() => blockchainManager.readOrCreateWallet(somePath, mockProvider)).toThrow(
        'Unexpected'
      )
    })
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
    const fileId = 123
    const fileHash = '456'
    const metadata = 'some-metadata'
    let mockTx

    beforeEach(async () => {
      mockTx = { wait: jest.fn() }
      mockContractInstance.uploadFile = jest.fn().mockResolvedValueOnce(mockTx)
      await blockchainManager.uploadFileInfo(fileId, fileHash, metadata)
    })

    test('should convert fileId and fileHash to BigInt and log debug info', async () => {
      expect(logger.debug).toHaveBeenCalledTimes(1)
      expect(logger.debug).toHaveBeenCalledWith(
        `upload fileInfo with bfileId: ${BigInt(fileId)}, bfileHash: ${BigInt(fileHash)}, metadata: ${metadata}`
      )
    })
    test('should log success message after "upload"', async () => {
      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(
        `fileInfo of Id ${fileId} uploaded to blockchain successfully`
      )
    })
    test('should call contract.uploadFile with correct arguments', async () => {
      expect(mockContractInstance.uploadFile).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.uploadFile).toHaveBeenCalledWith(
        BigInt(fileId),
        BigInt(fileHash),
        metadata
      )
      expect(mockTx.wait).toHaveBeenCalledTimes(1)
    })
    test('should throw error when transaction error occurs', async () => {
      mockContractInstance.uploadFile = jest
        .fn()
        .mockRejectedValueOnce(new Error('Transaction Error'))

      expect(blockchainManager.uploadFileInfo(fileId, fileHash, metadata)).rejects.toThrow(
        'Transaction Error'
      )
    })
  })

  describe('getFileInfo', () => {
    const fileUploadRecord = {
      args: {
        fileId: '0x124',
        fileHash: BigInt('0x456'),
        metadata: 'file_metadata',
        uploader: '0x789',
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
        BigInt(fileUploadRecord.args.fileId),
        BigInt(fileUploadRecord.args.uploader)
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
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`${fileUploadRecord.args.fileId}`)
      )
    })
  })

  describe('getReencryptFileInfo', () => {
    const fileUploadRecord = {
      args: {
        fileId: '0x124',
        fileHash: BigInt('0x456'),
        metadata: 'file_metadata',
        uploader: '0x789',
        requestor: '0x997265',
        timestamp: BigInt('0x486787')
      }
    }
    let result

    beforeEach(async () => {
      mockContractInstance.filters.ReencryptFileUploaded = jest.fn().mockReturnValueOnce({})
      mockContractInstance.queryFilter.mockResolvedValueOnce([fileUploadRecord])
      result = await blockchainManager.getReencryptFileInfo(
        fileUploadRecord.args.fileId,
        fileUploadRecord.args.uploader
      )
    })

    test('should call contract.filters.ReencryptFileUploaded with correct arguments', () => {
      expect(mockContractInstance.filters.ReencryptFileUploaded).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.filters.ReencryptFileUploaded).toHaveBeenCalledWith(
        BigInt(fileUploadRecord.args.fileId),
        BigInt(fileUploadRecord.args.uploader)
      )
    })
    test('should call contract.queryFilter with return value from contract.filters.ReencryptFileUploaded', () => {
      expect(mockContractInstance.queryFilter).toHaveBeenCalledTimes(1)
      expect(mockContractInstance.queryFilter).toHaveBeenCalledWith(expect.any(Object))
    })
    test('should return correct result', () => {
      expect(result).toEqual(fileUploadRecord)
    })
    test('should return null if contract.queryFilter return empty array', async () => {
      mockContractInstance.queryFilter.mockResolvedValueOnce([])
      result = await blockchainManager.getReencryptFileInfo(
        fileUploadRecord.args.fileId,
        fileUploadRecord.args.uploader
      )
      expect(result).toEqual(null)
    })
    test('should log success message', () => {
      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`${fileUploadRecord.args.fileId}`)
      )
    })
  })

  describe('getFileVerification', () => {
    const fileVerificationRecord = {
      args: {
        fileId: '0x124',
        uploader: '0x78843',
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
        BigInt(fileVerificationRecord.args.fileId),
        BigInt(fileVerificationRecord.args.uploader)
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
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`${fileVerificationRecord.args.fileId}`)
      )
    })
  })

  describe('getFileAuthRecord', () => {
    const fileAuthRecord = {
      args: {
        fileId: '0x124',
        requestor: '0x78843',
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
        BigInt(fileAuthRecord.args.fileId),
        BigInt(fileAuthRecord.args.requestor)
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
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`${fileAuthRecord.args.fileId}`)
      )
    })
  })
})
