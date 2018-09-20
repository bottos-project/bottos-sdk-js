const { addBlockHeader } = require('../lib/getFetchTemplate')
const packParamToParamArr = require('../lib/packParam')
const BTCryptTool = require('bottos-crypto-js');
const keystore = BTCryptTool.keystore
const { BasicPack } = require('bottos-js-msgpack')
// console.log('BTCryptTool', BTCryptTool)

/**
 * @typedef {Object} originFetchTemplate
 * @property {number} [originFetchTemplate.version=1] - Default value is 1.
 * @property {string} originFetchTemplate.sender - Default value is bottos.
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
 * @returns {Array<number>}
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
  let _defaultParams = {
    version: config.version || 1,
    sender: "bottos",
    contract: "bottos",
    method: "",
    param: {},
    sig_alg: 1
  }
  /**
   * @namespace Tool
   */
  const Tool = {
    _Api: Api,
    /**
     * @function Tool.buf2hex
     * @param {Uint8Array} buffer Uint8Array buffer.
     * @returns {string} Hexadecimal string.
     */
    buf2hex: function (b) {
      if (typeof b == 'string') return b;
      return BTCryptTool.buf2hex(b)
    },
  }

  /**
   * @param {Object} fetchTemplate
   * @param {string|Uint8Array} privateKey
   * @returns {string} signature
   */
  const signMsg = function (fetchTemplate, privateKey) {
    let encodeBuf = messageProtoEncode(fetchTemplate)
    const chain_id = Api.chain_id
    let msg = BTCryptTool.buf2hex(encodeBuf) + chain_id
    // console.log('aaa', BTCryptTool.buf2hex(a))
    let pri = keystore.str2buf(privateKey)
    let hashData = BTCryptTool.sha256(msg)
    let sign = BTCryptTool.sign(hashData, pri)
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
    let _originFetchTemplate = Object.assign({}, _defaultParams, originFetchTemplate)
    let fetchTemplate = addBlockHeader(_originFetchTemplate, blockHeader)
    let paramArr = packParamToParamArr(fetchTemplate, abi)
    // console.log('paramArr', paramArr)
    fetchTemplate.param = paramArr
    
    console.log('fetchTemplate', fetchTemplate)
    let signature = signMsg(fetchTemplate, privateKey)
    // console.log('signature', signature)

    fetchTemplate.param = BTCryptTool.buf2hex(paramArr)
    // console.log('fetchTemplate.param', fetchTemplate.param)
    fetchTemplate.signature = signature
    // console.log('fetchTemplate', fetchTemplate)
    return fetchTemplate
  }


  /**
   * @async
   * @function Tool.getRequestParams
   * @param {originFetchTemplate} originFetchTemplate
   * @param {string|Uint8Array} privateKey - Your private key.
   * @returns {Promise<Object>}
   */
  Tool.getRequestParams = function (originFetchTemplate, privateKey) {

    // 如果是内置合约
    if (originFetchTemplate.contract == "bottos") {
      return this._Api.getBlockHeader()
        .then((blockHeader) => processFetchTemplate(originFetchTemplate, blockHeader, privateKey))
    }
    // 如果不是内置合约
    return Api.getAbi(originFetchTemplate.contract)
    .then(abi => {
      // console.log('abi', abi)
      return this._Api.getBlockHeader()
        .then((blockHeader) => processFetchTemplate(originFetchTemplate, blockHeader, privateKey, abi))
    })
  }

  /**
   * Deploy an abi.
   * @async
   * @function Tool.deployABI
   * @param {Object} param
   * @param {string} param.contract - Contract name
   * @param {string} param.contract_abi - ABI file content.
   * @param {Object} senderInfo - The sender
   * @param {string} senderInfo.account - sender's account
   * @param {string|Uint8Array} senderInfo.privateKey - sender's privateKey
   * @returns {Promise<Object>}
   */
  // Tool.deployABI = function (param, senderInfo) {

  //   const contract_abi = [23,454,534,556,334,56,3,34,34,56,345,63,4,56]

  //   let params = {
  //     sender: senderInfo.account,
  //     method: "deployabi",
  //     param: {
  //       contract: param.contract,
  //       contract_abi
  //     }
  //   }

  //   return this._Api.getBlockHeader()
  //     .then((blockHeader) => processFetchTemplate(params, blockHeader, senderInfo.privateKey))
  //     .then(fetchTemplate => Tool._Api.request('/transaction/send', fetchTemplate))
  //     .then(res => res.json())

  // }

  return Tool
  
}

module.exports = ToolFactory