const { addBlockHeader } = require('./getFetchTemplate.js')
const packParamToParamArr = require('./packParam')
const { messageProtoEncode } = require('../lib/proto/index')
const BTCryptTool = require('bottos-crypto-js');
const keystore = BTCryptTool.keystore


function ToolFactory(config, Api) {

  const Tool = {
    _Api: Api
  }

  /**
   * @param {Object} fetchTemplate
   * @param {string|Uint8Array} privateKey
   * @returns {string} signature
   */
  const signMsg = function (fetchTemplate, privateKey) {
    let encodeBuf = messageProtoEncode(fetchTemplate)
    console.log('Api', Api)
    const chain_id = Api.chain_id
    let msg = BTCryptTool.buf2hex(encodeBuf) + chain_id
    // console.log('aaa', BTCryptTool.buf2hex(a))
    let hashData = BTCryptTool.sha256(msg)
    let sign = BTCryptTool.sign(hashData, keystore.str2buf(privateKey))
    let signature = sign.toString('hex')
    return signature;
  }

  /**
   * @private
   * @param {Object} originFetchTemplate
   * @param {number} originFetchTemplate.version
   * @param {string} originFetchTemplate.sender
   * @param {string} originFetchTemplate.contract
   * @param {string} originFetchTemplate.method
   * @param {Object} originFetchTemplate.param
   * @param {number} originFetchTemplate.sig_alg
   * @param {Object} blockHeader
   * @param {string|Uint8Array} privateKey
   */
  const processFetchTemplate = function (originFetchTemplate, blockHeader, privateKey, abi) {
    let fetchTemplate = addBlockHeader(originFetchTemplate, blockHeader)
    // console.log('fetchTemplate', fetchTemplate)
    let paramArr = packParamToParamArr(fetchTemplate, abi)
    // console.log('paramArr', paramArr)
    fetchTemplate.param = paramArr

    let signature = signMsg(fetchTemplate, privateKey)
    // console.log('signature', signature)

    fetchTemplate.param = BTCryptTool.buf2hex(paramArr)
    // console.log('fetchTemplate.param', fetchTemplate.param)
    fetchTemplate.signature = signature
    return fetchTemplate
  }



  /**
   * @param {Object} originFetchTemplate
   * @param {number} [originFetchTemplate.version]
   * @param {string} [originFetchTemplate.sender]
   * @param {string} originFetchTemplate.contract
   * @param {string} originFetchTemplate.method
   * @param {Object} originFetchTemplate.param
   * @param {number} [originFetchTemplate.sig_alg]
   * @param {string|Uint8Array} privateKey
   */
  Tool.getRequestParams = function(originFetchTemplate, privateKey) {
    let _defaultParams = {
      version: config.version,
      sender: "bottos",
      contract: "bottos",
      method: "",
      param: {},
      sig_alg: 1
    }
    let params = Object.assign({}, _defaultParams, originFetchTemplate)

    // 如果是内置合约
    if (params.contract == "bottos") {
      return this._Api.getBlockHeader()
        .then((blockHeader) => processFetchTemplate(params, blockHeader, privateKey))
    }
    // 如果不是内置合约
    Api.getAbi(params.contract)
    .then(abi => {
      return this._Api.getBlockHeader()
        .then((blockHeader) => processFetchTemplate(params, blockHeader, privateKey, abi))
    })
  }

  return Tool
  
}

module.exports = ToolFactory