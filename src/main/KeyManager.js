import ElGamal from 'basic_simple_elgamal'
import { getLogger } from './Logger'
import { writeFile } from 'node:fs'
import { readFile } from 'node:fs/promises'
const bigInt = require('big-integer')

// The public modulus p
//TODO: maybe should be stored and read from file
const p =
  '30149118678593113953869704012498360554612003819643110369489470362770343716433650400386190474466049787676436459959134922944058349480731627770175877708588659263118765013612864271373877928494736976380129060850938098146039580900080564510390377944300560035578891449907697779649384875353345486952026067992903623992417321033421067657276513073634064655183781646560676934552854404646818155979036855037083798194111546111897340914366232128270587235855720236132033149586010103195511819702390982686683593192285895037699459375835272832460605256802131576813114192528398143047090247007627513281085152643954792373928662301060519185187'
// The public generator. Maybe these should all be random for each people?
const g = '3'
const keyFilePath = 'elgamal.keys'

export async function getKeys() {
  return readFile(keyFilePath, 'utf-8')
    .then((data) => {
      // if key exist, load key
      getLogger().info('Keys found. Loading keys...')
      const elgamal = new ElGamal()
      const parsedData = JSON.parse(data)
      // Make the format suitable for engine import
      const importData = {
        security: parsedData.securityLevel,
        x: bigInt(parsedData.x),
        g: bigInt(parsedData.g),
        p: bigInt(parsedData.p),
        y: bigInt(parsedData.y)
      }
      elgamal.import(importData)
      getLogger().debug(importData)
      elgamal.setSecurityLevel('HIGH')
      if (!elgamal.checkSecurity()) {
        getLogger().error('Loaded keys are not secure.')
        throw new Error('Keys not secure')
      }
      getLogger().info('Keys loaded successfully')
      return elgamal
    })
    .catch(async (err) => {
      if (err.code === 'ENOENT') {
        // else create key
        getLogger().info('Keys not found. Creating keys...')
        const elgamal = new ElGamal(p, g)
        try {
          await elgamal.fillIn()
          getLogger().info(`Keys successfully created. Keys are secure: ${elgamal.checkSecurity()}`)
          getLogger().info('storing keys to file...')
          elgamal.setSecurityLevel('LOW')
          const exportedEngine = elgamal.export()
          writeFile(keyFilePath, JSON.stringify(exportedEngine), 'utf-8', (err_1) => {
            if (err_1) {
              throw err_1
            }
            getLogger().info('keys have been saved!')
          })
          elgamal.setSecurityLevel('HIGH')
          return elgamal
        } catch (err_2) {
          getLogger().error(`Keys initialization failed due to following error: ${err_2}`)
          throw err_2
        }
      } else {
        throw err
      }
    })
  // elgamal
  //   .initializeRemotely(2024)
  //   .then(() => {
  //     const secure = elgamal.checkSecurity()
  //     getLogger().info(`Key successfully created. Key is secure: ${secure}`)
  //     return elgamal
  //   })
  //   .catch((reason) => {
  //     getLogger().error(`Key initialization failed due to following reason: ${reason}`)
  //   })
}
