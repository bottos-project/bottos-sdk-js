const { addBlockHeader } = require('../lib/getFetchTemplate')
const packParamToParamArr = require('../lib/packParam')
const PackBin16 = require('../lib/packParam').PackBin16
const { BasicPack, BTPack } = require('bottos-js-msgpack')

/**
 * A template used in send transaction. 
 * @typedef {Object} originFetchTemplate
 * @property {string} originFetchTemplate.sender - Default value is bottos.
 * @property {string} [originFetchTemplate.contract=bottos] - The contract. Default value is bottos.
 * @property {string} originFetchTemplate.method - Method in Abi, not required when a exteral contract is called.
 * @property {Object} originFetchTemplate.param
 * @property {number} [originFetchTemplate.version=1] - Default value is 1.
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
  let pParam = PackBin16(new Uint8Array(msg.param))

  let pSigalg = BasicPack.PackUint32(msg.sig_alg)

  let buf = [...pArraySize, ...pVersion, ...pCursorNum, ...pCursorLabel, ...pLifeTime, ...pSender, ...pContract, ...pMethod, ...pParam, ...pSigalg]

  return buf
}


function ToolFactory(config, Api) {
  const BTCryptTool = config.crypto
  const keystore = BTCryptTool.keystore

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
   * @param {(string|Buffer)} privateKey
   * @returns {string} signature
   */
  const signMsg = function (fetchTemplate, privateKey) {
    let encodeBuf = messageProtoEncode(fetchTemplate)
    const chain_id = Api.chain_id
    let msg = BTCryptTool.buf2hex(encodeBuf) + chain_id
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
   * @param {(string|Buffer)} privateKey
   * @param {Object} abi
   * @returns {Object}
   */
  const processFetchTemplate = function (originFetchTemplate, blockHeader, privateKey, abi) {
    let fetchTemplate = addBlockHeader(originFetchTemplate, blockHeader)
    let paramArr = packParamToParamArr(fetchTemplate, abi)
    fetchTemplate.param = paramArr
    let signature = signMsg(fetchTemplate, privateKey)
    fetchTemplate.param = BTCryptTool.buf2hex(paramArr)
    // console.log('fetchTemplate.param', fetchTemplate.param)
    fetchTemplate.signature = signature
    // console.log('fetchTemplate', fetchTemplate)
    return fetchTemplate
  }

  /**
   * @private
   * @param {originFetchTemplate} originFetchTemplate
   * @param {Object} blockHeader
   * @param {(string|Buffer)} privateKey
   * @param {(Object|null)} abi
   * @returns {Object}
   */
  const processExternalFetchTemplate = function (originFetchTemplate, blockHeader, privateKey, abi) {
    let fetchTemplate = addBlockHeader(originFetchTemplate, blockHeader)
    let method = fetchTemplate.method
    // 这里做个判断，如果 abi 是 null，就不用 pack，直接传空数组
    var packBuf = abi == null ? [] : BTPack(fetchTemplate.param, abi[method])
    fetchTemplate.param = packBuf
    let signature = signMsg(fetchTemplate, privateKey)
    fetchTemplate.param = BTCryptTool.buf2hex(packBuf)
    // console.log('fetchTemplate.param', fetchTemplate.param)
    fetchTemplate.signature = signature
    // console.log('fetchTemplate', fetchTemplate)
    return fetchTemplate
  }

  /**
   * @async
   * @function Tool.getTransactionInfo
   * @param {string} trx_hash
   * @returns {Promise<Object>}
   */
  Tool.getTransactionInfo = function(trx_hash) {
    return Api.request('/transaction/get', {trx_hash}).then(res => res.json())
  }

  /**
   * @async
   * @function Tool.getRequestParams
   * @param {originFetchTemplate} originFetchTemplate
   * @param {(string|Buffer)} privateKey - Your private key.
   * @returns {Promise<Object>}
   */
  Tool.getRequestParams = function (originFetchTemplate, privateKey) {
    let _originFetchTemplate = Object.assign({}, _defaultParams, originFetchTemplate)

    // 如果是内置合约
    if (_originFetchTemplate.contract == "bottos") {
      return this._Api.getBlockHeader()
        .then((blockHeader) => processFetchTemplate(_originFetchTemplate, blockHeader, privateKey))
    }
    // 如果不是内置合约，请求外置合约，外置合约的合约名就是发布合约的用户名
    return Api.getAbi(_originFetchTemplate.contract)
    .then(abi => this._Api.getBlockHeader()
      .then((blockHeader) => processExternalFetchTemplate(_originFetchTemplate, blockHeader, privateKey, abi)))
  }

  return Tool

}


module.exports = ToolFactory
