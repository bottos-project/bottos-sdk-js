const { BasicPack } = require('bottos-js-msgpack')

/**
 * @private
 */
function contractFactory(Tool) {

  /**
   * @namespace Contract
   */
  const Contract = {}

  /**
   * Deploy a contract. The name of the contract is account name, and the code is expected a wasm file.
   * @async
   * @function Contract.deployCode
   * @param {Object} param
   * @param {number} [param.vm_type=1] - vm_type, now is 1.
   * @param {number} [param.vm_version=1] - vm_version, now is 1.
   * @param {(Uint8Array|ArrayBuffer)} param.contract_code - wasm file buffer.
   * @param {Object} senderInfo - The sender
   * @param {string} senderInfo.account - sender's account
   * @param {(string|Buffer)} senderInfo.privateKey - sender's privateKey
   * @returns {Promise<Object>}
   */
  Contract.deployCode = function (param, senderInfo) {
    let code = param.contract_code
    if (code instanceof ArrayBuffer) {
      code = new Uint8Array(code)
    }

    let params = {
      sender: senderInfo.account,
      method: "deploycode",
      param: {
        contract: senderInfo.account,
        vm_type: param.vm_type != undefined ? param.vm_type : 1,
        vm_version: param.vm_version != undefined ? param.vm_version : 1,
        contract_code: code
      }
    }

    return Tool.getRequestParams(params, senderInfo.privateKey)
      .then(fetchTemplate => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())

  }

  /**
   * Deploy an abi.
   * @async
   * @function Contract.deployABI
   * @param {Object} param
   * @param {(string|Uint8Array|ArrayBuffer)} param.contract_abi - ABI content or file buffer.
   * @param {string} [param.filetype=js] - ABI file type, js or wasm. Default is js.
   * @param {Object} senderInfo - The sender
   * @param {string} senderInfo.account - sender's account
   * @param {string|Buffer} senderInfo.privateKey - sender's privateKey
   * @returns {Promise<Object>}
   */
  Contract.deployABI = function (param, senderInfo) {
    let code = param.contract_abi
    if (typeof code == 'string') {
      code = BasicPack.PackStr16(code).slice(3)
    } else if (code instanceof ArrayBuffer) {
      code = new Uint8Array(code)
    } else if (!(code instanceof Uint8Array)) {
      console.warn('Type error. param contract_abi: ' + param.contract_abi + ' could not be transcode to Uint8Array')
    }

    let filetype = param.filetype || 'js'
    if (filetype != 'js' && filetype != 'wasm') {
      console.error('Params error, the value of filetype must be "js" or "wasm".')
    }

    let params = {
      sender: senderInfo.account,
      method: "deployabi",
      param: {
        contract: senderInfo.account,
        contract_abi: code,
        filetype
      }
    }

    return Tool.getRequestParams(params, senderInfo.privateKey)
      // .then(fetchTemplate => console.log('deployCode fetchTemplate: ', fetchTemplate))
      .then(fetchTemplate => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())

  }

  /**
   * @async
   * @function Contract.callContract
   * @param {originFetchTemplate} originFetchTemplate
   * @param {(string|Buffer)} privateKey
   * @returns {Promise<Object>}
   */
  Contract.callContract = function (originFetchTemplate, privateKey) {
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then(fetchTemplate => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())
  }

  return Contract
}

module.exports = contractFactory
