const BTCrypto = require('bottos-crypto-js');
const packParam = require('./packParam')
const { messageProtoEncode } = require('../lib/proto/index')

/**
 * 
 * @param {string} account - account
 * @param {Object} keys - Public and private key pair
 * @param {Uint8Array} keys.publicKey
 * @param {Uint8Array} keys.privateKey
 * @param {Object} blockHeader
 * @returns {Object} fetchTemplate
 */
function registerParam(account, keys, blockHeader, referrer) {

  let param = {
    "name": account,
    "pubkey": BTCrypto.buf2hex(keys.publicKey)
  }

  let fetchTemplate = {
    version: 1,
    ...blockHeader,
    sender: referrer || "bottos", // referrer or bottos
    contract: "bottos",
    method: "newaccount",
    param,
    sig_alg: 1
  }

  return packParam(param, fetchTemplate, keys.privateKey)

}

module.exports = registerParam