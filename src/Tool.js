const { addBlockHeader } = require('../lib/getFetchTemplate')
const packParamToParamArr = require('../lib/packParam')
const BTCryptTool = require('bottos-crypto-js');
const keystore = BTCryptTool.keystore
const { BasicPack } = require('bottos-js-msgpack')

/**
 * @typedef {Object} originFetchTemplate
 * @property {number} [originFetchTemplate.version=1] - Default value is 1.
 * @property {string} [originFetchTemplate.sender=bottos] - Default value is bottos.
 * @property {string} [originFetchTemplate.contract=bottos] - The contract. Default value is bottos.
 * @property {string} originFetchTemplate.method
 * @property {Object} originFetchTemplate.param
 * @property {number} [originFetchTemplate.sig_alg=1] - Default value is 1.
 */


/**
 * encode the message
 * @private
 * @param {Object} msg 
 * @param {number} msg.version
 * @param {number} msg.cursor_num
 * @param {number} msg.cursor_label
 * @param {number} msg.lifetime
 * @param {string} msg.sender 
 * @param {string} msg.contract 
 * @param {string} msg.method 
 * @param {Array<number>} msg.param 
 * @param {number} msg.sig_alg
 */
const messageProtoEncode = (msg) => {
  let pArraySize = BasicPack.PackArraySize(9)
  let pVersion = BasicPack.PackUint32(msg.version)
  let pCursorNum = BasicPack.PackUint64(msg.cursor_num)
  let pCursorLabel = BasicPack.PackUint32(msg.cursor_label)
  let pLifeTime = BasicPack.PackUint64(msg.lifetime)
  let pSender = BasicPack.PackStr16(msg.sender)
  let pContract = BasicPack.PackStr16(msg.contract)
  let pMethod = BasicPack.PackStr16(msg.method)
  let pParam = BasicPack.PackBin16(Uint8Array.from(msg.param))

  let uint8Param = new Uint8Array(pParam.byteLength)
  for (let i = 0; i < pParam.byteLength; i++) {
    uint8Param[i] = pParam[i]
  }
  // console.log({ uint8Param })
  let pSigalg = BasicPack.PackUint32(msg.sig_alg)

  let buf = [...pArraySize, ...pVersion, ...pCursorNum, ...pCursorLabel, ...pLifeTime, ...pSender, ...pContract, ...pMethod, ...uint8Param, ...pSigalg]

  return buf
}


function ToolFactory(config, Api) {
  /**
   * @namespace Tool
   */
  const Tool = {
    _Api: Api,
    /**
     * @inner
     * @param {Uint8Array} buffer Uint8Array buffer.
     * @returns {string} Hexadecimal string.
     */
    buf2hex: BTCryptTool.buf2hex,
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
   * @param {originFetchTemplate} originFetchTemplate
   * @param {Object} blockHeader
   * @param {string|Uint8Array} privateKey
   * @returns {Object}
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
   * @inner
   * @memberof Tool
   * @param {originFetchTemplate} originFetchTemplate
   * @param {string|Uint8Array} privateKey - Your private key.
   * @returns {Promise|undefined} If callback is undefined, a promise will be returned.
   */
  Tool.getRequestParams = function (originFetchTemplate, privateKey) {
    let _defaultParams = {
      version: config.version || 1,
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
    return Api.getAbi(params.contract)
    .then(abi => {
      return this._Api.getBlockHeader()
        .then((blockHeader) => processFetchTemplate(params, blockHeader, privateKey, abi))
    })
  }

  return Tool
  
}

module.exports = ToolFactory