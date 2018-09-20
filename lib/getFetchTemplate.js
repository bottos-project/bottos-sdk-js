const BTCryptTool = require('bottos-crypto-js');
const keystore = BTCryptTool.keystore

function addBlockHeader(fetchTemplate, blockHeader) {
  return Object.assign({}, fetchTemplate, blockHeader)
}

/**
 * @param {Object} params - the params
 * @param {string} params.account - account
 * @param {string|Uint8Array} params.publicKey - publicKey
 * @param {string} [params.referrer] - referrer
 * @returns {Object} fetchTemplate
 */
function getRegisterFetchTemplate(params) {

  let publicKey = params.publicKey
  if (!keystore.isHex(publicKey)) {
    publicKey = BTCryptTool.buf2hex(publicKey)
    console.log('publicKey', publicKey)
  }

  let param = {
    "name": params.account,
    "pubkey": publicKey
  }

  return {
    sender: params.referrer || "bottos", // referrer or bottos
    method: "newaccount",
    param,
  }

}


/**
 * @param {Object} params
 * @param {string} params.from
 * @param {string} params.to
 * @param {string|number} params.value
 * @returns {Object}
 */
function getTransferFetchTemplate(params) {

  let param = {
    "from": params.from,
    "to": params.to,
    "value": params.value * Math.pow(10, 8)
  }

  return {
    sender: params.from,
    method: "transfer",
    param
  }
}



exports.addBlockHeader = addBlockHeader
exports.getRegisterFetchTemplate = getRegisterFetchTemplate
exports.getTransferFetchTemplate = getTransferFetchTemplate
