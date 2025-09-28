import * as mcl from 'mcl-wasm'
import { logger } from './Logger'
import GlobalValueManager from './GlobalValueManager'
import { assert } from 'assert'
import io from 'socket.io-client'
import KeyManager from './KeyManager'

// This is used because we only have self-signed certificates.
// Should be removed in real deployment environment
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

class ABSEManager {
  keyManager
  /**
   *
   * @param {KeyManager} keyManager
   */
  constructor(keyManager) {
    this.keyManager = keyManager
  }
  async init() {
    await mcl.init(mcl.BLS12_381)
    await this.getPP()
  }
  async getPP() {
    if (this.pp) return this.pp
    try {
      const fetchUrl = `${GlobalValueManager.trustedAuthority.url}/pp`
      logger.info(`fetching ${fetchUrl} for public parameters.`)
      const response = await fetch(fetchUrl)
      if (!response.ok) {
        logger.warn(`Cannot get public parameter from trusted authority`, { response })
        return null
      }
      logger.info(`Successfully fetched public parameters for ABSE.`)
      const pp = await response.json()
      this.pp = {
        g1: mcl.deserializeHexStrToG1(pp.g1),
        g2: mcl.deserializeHexStrToG2(pp.g2),
        eggalpha: mcl.deserializeHexStrToGT(pp.eggalpha),
        h: mcl.deserializeHexStrToG1(pp.h),
        h_i: new Array(pp.h_i.length),
        U: pp.U
      }
      for (let i = 0; i < pp.h_i.length; i++) {
        this.pp.h_i[i] = mcl.deserializeHexStrToG1(pp.h_i[i])
      }
      this.pp = pp
      return pp
    } catch (error) {
      logger.error(error)
      return null
    }
  }
  async getKey() {
    return new Promise((resolve, reject) => {
      function getSearchKeyError(error) {
        logger.error(`Get search key failed because of following error: ${error}`)
        GlobalValueManager.sendNotice('Failed to get search key', 'error')
        reject('Cannot get search key.')
      }
      if (this.SK && this.y) {
        resolve({ SK: this.SK, y: this.y })
        return
      }
      // Ask for search key
      const socket = io(GlobalValueManager.trustedAuthority.url, {
        rejectUnauthorized: false
      })
      socket.on('connect', () => {
        try {
          logger.info('Asking to get search key...')
          socket.emit(
            'auth',
            { publicKey: this.keyManager.getPublicKeyString() },
            async ({ errorMsg, cipher, spk }) => {
              if (errorMsg) {
                getSearchKeyError(errorMsg)
                return
              }

              // respond to auth and get key
              const decryptedValue = await this.keyManager.decrypt(cipher, spk)
              socket.emit('auth-res', { decryptedValue }, ({ errorMsg, SK, y }) => {
                try {
                  if (errorMsg) {
                    getSearchKeyError(errorMsg)
                    return
                  }
                  if (SK) {
                    this.SK = {
                      sk1: mcl.deserializeHexStrToG2(SK.sk1),
                      sk2: mcl.deserializeHexStrToG2(SK.sk2),
                      sk3: mcl.deserializeHexStrToG2(SK.sk3),
                      sky: mcl.deserializeHexStrToG2(SK.sky)
                    }
                    this.y = y
                    resolve({ SK: this.SK, y: this.y })
                    return
                  } else {
                    getSearchKeyError('Trusted authority respond with empty object')
                    return
                  }
                } catch (error) {
                  getSearchKeyError(error)
                }
              })
            }
          )
        } catch (error) {
          getSearchKeyError(error)
        }
      })
    })
  }

  async Enc(W, P) {
    const pp = await this.getPP()
    // Access policy vector x
    const x = new Array(pp.U.length + 1)
    let sum = new mcl.Fr()
    let i
    for (i = 0; i < pp.U.length; i++) {
      const xi = new mcl.Fr()
      if (P.includes(pp.U[i])) {
        xi.setByCSPRNG()
        sum = mcl.add(sum, xi)
      }
      x[i] = xi
    }
    x[i] = mcl.neg(sum)
    sum = new mcl.Fr()
    for (i = 0; i < x.length; i++) {
      sum = mcl.add(sum, x[i])
    }
    assert(sum.isZero())
    const t = new mcl.Fr()
    t.setByCSPRNG()
    const ctStar = mcl.mul(pp.h, t)
    const eggat = mcl.pow(pp.eggalpha, t)
    const ctw = new Array(W.length)
    for (i = 0; i < W.length; i++) {
      const wHash = mcl.hashToFr(W[i])
      const P = mcl.pairing(mcl.mul(pp.g1, wHash), mcl.mul(pp.g2, t))
      ctw[i] = mcl.mul(eggat, P)
    }
    const ct = new Array(pp.h_i.length)
    for (i = 0; i < pp.h_i.length; i++) {
      ct[i] = mcl.add(mcl.mul(pp.h_i[i], t), mcl.mul(pp.g1, x[i]))
    }
    const CTw = { ctStar, ctw, ct }
    // console.log(CTm);
    // console.log(CTw);
    return CTw
  }
  async Trapdoor(WPrime) {
    const { SK, y } = await this.getKey()
    let sum = new mcl.Fr()
    const dPrime = new mcl.Fr()
    dPrime.setInt(WPrime.length)
    WPrime.forEach((w) => {
      sum = mcl.add(sum, mcl.hashToFr(w))
    })
    const T0 = mcl.mul(SK.sk2, sum)
    const TStar = mcl.add(mcl.mul(SK.sk1, dPrime), T0)
    const T = new Array(y.length)
    const zero = new mcl.Fr()
    zero.setInt(0)
    for (let i = 0; i < y.length; i++) {
      if (y[i] == 1) {
        T[i] = SK.sk3
      } else {
        T[i] = mcl.mul(SK.sk3, zero)
      }
    }
    const TK = { TStar, T, sky: SK.sky, dPrime: WPrime.length }
    // console.log(TK)
    // console.log(T)
    return TK
  }
}

export default ABSEManager
