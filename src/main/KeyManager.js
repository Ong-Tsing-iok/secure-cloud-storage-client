import ElGamal from 'basic_simple_elgamal'
import { logger } from './Logger'
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
let keyEngine = null

// TODO: store engine somewhere
async function getKeyEngine() {
  if (keyEngine) {
    return new Promise((resolve) => resolve(keyEngine))
  } else {
    return readFile(keyFilePath, 'utf-8')
      .then((data) => {
        // if key exist, load key
        logger.info('Keys found. Loading keys...')
        const parsedData = JSON.parse(data)
        const elgamal = importElgamal(parsedData.p, parsedData.g, parsedData.y, parsedData.x)
        keyEngine = elgamal
        return elgamal
      })
      .catch(async (err) => {
        if (err.code === 'ENOENT') {
          // else create key
          logger.info('Keys not found. Creating keys...')
          const elgamal = new ElGamal(p, g)
          try {
            await elgamal.fillIn()
            logger.info(`Keys successfully created. Keys are secure: ${elgamal.checkSecurity()}`)
            logger.info('storing keys to file...')
            elgamal.setSecurityLevel('LOW')
            const exportedEngine = elgamal.export()
            writeFile(keyFilePath, JSON.stringify(exportedEngine), 'utf-8', (err_1) => {
              if (err_1) {
                throw err_1
              }
              logger.info('keys have been saved!')
            })
            elgamal.setSecurityLevel('HIGH')
            keyEngine = elgamal
            return elgamal
          } catch (err_2) {
            logger.error(`Keys initialization failed due to following error: ${err_2}`)
            throw err_2
          }
        } else {
          throw err
        }
      })
  }
  // elgamal
  //   .initializeRemotely(2024)
  //   .then(() => {
  //     const secure = elgamal.checkSecurity()
  //     logger.info(`Key successfully created. Key is secure: ${secure}`)
  //     return elgamal
  //   })
  //   .catch((reason) => {
  //     logger.error(`Key initialization failed due to following reason: ${reason}`)
  //   })
}
/**
 * Create an Elgamal engine with import data.
 * @summary This is used because the import function in basic_simple_elgamal have bugs.
 * @param {string} p The public modulus.
 * @param {string} g The public generator.
 * @param {string} y The public key.
 * @param {string} x The private key.
 * @return {ElGamal} The imported Elgamal engine.
 */
function importElgamal(p, g, y, x) {
  const elgamal = new ElGamal(p, g, y, x)
  elgamal.setSecurityLevel('HIGH')
  if (!elgamal.checkSecurity()) {
    logger.error('Loaded keys are not secure.')
    throw new Error('Keys not secure')
  }
  logger.info('Keys loaded successfully')
  return elgamal
}

/**
 * Decrypt the cipher using Elgamal.
 * @param {} c1
 * @param {} c2
 * @return {Promise<bigInt.BigInteger>} The decrypted value.
 */
export async function decrypt(c1, c2) {
  const elgamal = await getKeyEngine()
  return elgamal.decrypt({ c1: bigInt(c1), c2: bigInt(c2) })
}

export async function encrypt(message) {
  const elgamal = await getKeyEngine()
  return elgamal.encrypt(bigInt(message))
}

export async function getKeyPublic() {
  return (await getKeyEngine()).export()
  // return engine.p, engine.g, engine.y
}
