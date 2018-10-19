
function buf2hex(buffer) {
    return Array.prototype.map.call(buffer, function (x) {
        return ('00' + x.toString(16)).slice(-2);
    }).join('');
};

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
  if (typeof publicKey != 'string') {
    publicKey = buf2hex(publicKey)
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

  const value = params.value * 1e8

  let param = {
    "from": params.from,
    "to": params.to,
    "value": Number.parseInt(value)
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
