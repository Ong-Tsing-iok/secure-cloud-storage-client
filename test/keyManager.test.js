import { expect, test } from '@jest/globals'
import * as KeyManager from '../src/main/KeyManager'
import { readFileSync } from 'fs'

test('initKeys', async () => {
  await KeyManager.initKeys()
  expect(KeyManager.getPublicKey()).toBeDefined()
  expect(readFileSync('nal16.keys', 'utf-8')).toBeDefined()
})

test('encrypt-decrypt', async () => {
  await KeyManager.initKeys()
  const message = 'testmessage'
  const cipher = await KeyManager.encrypt(message)
  const decrypted = await KeyManager.decrypt(cipher)
  expect(decrypted).toBe(message)
})
