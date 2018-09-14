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
        if (res.errcode == 0) {
          return this.createKeystore({
            account: params.account,
            password: keys.password,
            privateKey
          })
        } else {
          throw new Error("createAccount error: ", res)
        }
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

var a = [0xdc, 0x0, 0x9, 0xce, 0x0, 0x0, 0x0, 0x1, 0xcf, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1, 0xce, 0x41, 0x4e, 0x78, 0xed, 0xcf, 0x0, 0x0, 0x0, 0x0, 0x5b, 0x9b, 0x75, 0xbb, 0xda, 0x0, 0x6, 0x62, 0x6f, 0x74, 0x74, 0x6f, 0x73, 0xda, 0x0, 0x6, 0x62, 0x6f, 0x74, 0x74, 0x6f, 0x73, 0xda, 0x0, 0xa, 0x6e, 0x65, 0x77, 0x61, 0x63, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0xc5, 0x0, 0x93, 0xdc, 0x0, 0x2, 0xda, 0x0, 0x8, 0x74, 0x65, 0x73, 0x74, 0x74, 0x65, 0x73, 0x74, 0xda, 0x0, 0x82, 0x30, 0x34, 0x35, 0x34, 0x66, 0x31, 0x63, 0x32, 0x32, 0x32, 0x33, 0x64, 0x35, 0x35, 0x33, 0x61, 0x61, 0x36, 0x65, 0x65, 0x35, 0x33, 0x65, 0x61, 0x31, 0x63, 0x63, 0x65, 0x61, 0x38, 0x62, 0x37, 0x62, 0x66, 0x37, 0x38, 0x62, 0x38, 0x63, 0x61, 0x39, 0x39, 0x66, 0x33, 0x66, 0x66, 0x36, 0x32, 0x32, 0x61, 0x33, 0x62, 0x62, 0x33, 0x65, 0x36, 0x32, 0x64, 0x65, 0x64, 0x63, 0x37, 0x31, 0x32, 0x30, 0x38, 0x39, 0x30, 0x33, 0x33, 0x64, 0x36, 0x30, 0x39, 0x31, 0x64, 0x37, 0x37, 0x32, 0x39, 0x36, 0x35, 0x34, 0x37, 0x62, 0x63, 0x30, 0x37, 0x31, 0x30, 0x32, 0x32, 0x63, 0x61, 0x32, 0x38, 0x33, 0x38, 0x63, 0x39, 0x65, 0x38, 0x36, 0x64, 0x65, 0x63, 0x32, 0x39, 0x36, 0x36, 0x37, 0x63, 0x66, 0x37, 0x34, 0x30, 0x65, 0x35, 0x63, 0x39, 0x65, 0x36, 0x35, 0x34, 0x62, 0x36, 0x31, 0x32, 0x37, 0x66, 0xce, 0x0, 0x0, 0x0, 0x1, 0x4b, 0x97, 0xb9, 0x2d, 0x2c, 0x78, 0xbc, 0xff, 0xe9, 0x5e, 0xbd, 0x30, 0x67, 0x56, 0x5c, 0x73, 0xa2, 0x93, 0x1b, 0x39, 0xd5, 0xeb, 0x72, 0x34, 0xb1, 0x18, 0x16, 0xdc, 0xec, 0x54, 0x76, 0x1a]

/**
 * @param {Object} fetchTemplate 
 * @param {string|Uint8Array} privateKey
 * @returns {string} signature
 */
Wallet.prototype.signMsg = function (fetchTemplate, privateKey) {
  let encodeBuf = messageProtoEncode(fetchTemplate)
  const chain_id = this._requestManager.chain_id
  console.log('this._requestManager', this._requestManager)
  let msg = BTCryptTool.buf2hex(encodeBuf) + chain_id
  // console.log('aaa', BTCryptTool.buf2hex(a))
  console.log('msg', msg) // 一样的
  // console.assert(BTCryptTool.buf2hex(a) === msg, "!!!!!")
  let hashData = BTCryptTool.sha256(msg)
  let sign = BTCryptTool.sign(hashData, keystore.str2buf(privateKey))
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
  // console.log('fetchTemplate.param', fetchTemplate.param)
  fetchTemplate.signature = signature
  return fetchTemplate
}


module.exports = Wallet