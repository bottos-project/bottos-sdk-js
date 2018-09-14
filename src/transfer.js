const BTCrypto = require('bottos-crypto-js');
const packParam = require('./packParam')
const { messageProtoEncode } = require('../lib/proto/index')

/**
 * 
 * @param {Object} params
 * @param {string} params.from
 * @param {string} params.to
 * @param {string|number} params.value
 * @param {Object} keys - Public and private key pair
 * @param {Uint8Array} keys.publicKey
 * @param {Uint8Array} keys.privateKey
 * @param {Object} blockHeader
 * @returns {Object} fetchTemplate
 */
function transferParam(params, keys, blockHeader) {

  let param = {
    "from": params.from,
    "to": params.to,
    "value": params.value * Math.pow(10, 8)
  }

  let fetchTemplate = {
    version: 1,
    ...blockHeader,
    sender: "bottos",
    contract: "bottos",
    method: "transfer",
    param,
    sig_alg: 1
  }

  return packParam(param, fetchTemplate, keys.privateKey)

}

module.exports = transferParam