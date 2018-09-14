const BTCryptTool = require('bottos-crypto-js');
const { messageProtoEncode } = require('../lib/proto/index')

const keystore = BTCryptTool.keystore
const packParamToParamArr = require('./packParam')
const { addBlockHeader, getRegisterFetchTemplate, getTransferFetchTemplate } = require('./getFetchTemplate.js')

/**
 * 
 * @param {Object} _requestManager 
 */
function Wallet(_requestManager) {
  this._requestManager = _requestManager
}


/**
 * register account on chain
 * @param {Object} params - the params
 * @param {string} params.account - account
 * @param {string} params.password - password
 * @param {string} [params.referrer] - referrer
 * @returns {Promise}
 */
Wallet.prototype.createAccount = function (params) {
  return this._requestManager.getBlockHeader()
    .then((blockHeader) => {
      // 1. create key pair
      const keys = keystore.createKeys()

      // 2. pack params
      let __params = {
        account: params.account,
        publicKey: keys.publicKey,
        referrer: params.referrer
      }
      let originFetchTemplate = getRegisterFetchTemplate(__params)
      let privateKey = keys.privateKey
      let fetchTemplate = this.processFetchTemplate(originFetchTemplate, blockHeader, privateKey)

      // 3. try to register on chain
      return this._requestManager.request('/transaction/send', fetchTemplate).then(res => res.json()).then(res => {
        console.log('createAccount res: ', res)
        return res
      })
    })

}

/**
 * Create public and private key pair
 * @returns {Object} keys
 */
Wallet.prototype.createKeys = function() {
  return keystore.createKeys()
  // return BTCryptTool.createPubPrivateKeys()
}

// account: "adfa",
// crypto: { cipher: "aes-128-ctr", ciphertext: "54f831f74056a683f758c27df56cf460671fae59549894aa4fb4a9935d0eccd6", cipherparams: { … }, mac: "0300f99245dea92dfe22dcc083ebe171f1c172871b4686a03b03e272c0139253", kdf: "scrypt", … },
// id: "12f16bd2-3d1e-4dfd-98d9-b1124c9d084b",
// version: 3,

/**
 * @param {Object} params - the params required for create keystore
 * @param {string} params.account - account
 * @param {string} params.password - password
 * @param {*} [params.privateKey] - privateKey
 * @returns {Object} keystore
 */
Wallet.prototype.createKeystore = function (params) {
  const account = params.account,
    password = params.password,
    privateKey = params.privateKey
  return keystore.create({ account, password, privateKey })
}

/**
 * 
 * @param {string} password - password
 * @param {Object} keyObject - the keystore
 * @returns {ArrayBuffer} privateKey - privateKey
 */
Wallet.prototype.recoverKeystore = keystore.recover.bind(keystore)

/**
 * private method
 */
// Wallet.prototype.signTransaction = function() {

// }

/**
 * 
 * @param {Object} params
 * @param {string} params.from
 * @param {string} params.to
 * @param {string|number} params.value
 * @param {string|Uint8Array} privateKey
 */
Wallet.prototype.sendTransaction = function (params, privateKey) {
  // const contract = token_type === "BTO" ? "bottos" : "bottostoken",
  return this._requestManager.getBlockHeader()
    .then((blockHeader) => {
      let originFetchTemplate = getTransferFetchTemplate(params)

      let fetchTemplate = this.processFetchTemplate(originFetchTemplate, blockHeader, privateKey)

      return this._requestManager.request('/transaction/send', fetchTemplate).then(res => res.json())
    })

}

/**
 * @param {Object} fetchTemplate 
 * @param {string|Uint8Array} privateKey
 * @returns {string} signature
 */
Wallet.prototype.signMsg = function (fetchTemplate, privateKey) {
  let encodeBuf = messageProtoEncode(fetchTemplate)
  const chain_id = this._requestManager.chain_id
  let hashData = BTCryptTool.sha256(BTCryptTool.buf2hex(encodeBuf) + chain_id)
  let sign = BTCryptTool.sign(hashData, keystore.str2buf(privateKey))
  // console.log('sign', sign);
  let signature = sign.toString('hex')
  return signature;
}


/**
 * @private
 * @param {Object} originFetchTemplate 
 * @param {Object} blockHeader
 * @param {string|Uint8Array} privateKey
 */
Wallet.prototype.processFetchTemplate = function (originFetchTemplate, blockHeader, privateKey) {
  let fetchTemplate = addBlockHeader(originFetchTemplate, blockHeader)
  // console.log('fetchTemplate', fetchTemplate)
  let paramArr = packParamToParamArr(fetchTemplate)
  // console.log('paramArr', paramArr)
  fetchTemplate.param = paramArr

  let signature = this.signMsg(fetchTemplate, privateKey)
  // console.log('signature', signature)

  fetchTemplate.param = BTCryptTool.buf2hex(paramArr)
  fetchTemplate.signature = signature
  return fetchTemplate
}


module.exports = Wallet