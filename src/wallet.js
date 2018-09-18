const BTCryptTool = require('bottos-crypto-js');
const { messageProtoEncode } = require('../lib/proto/index')

const keystore = BTCryptTool.keystore
keystore.constants.scrypt.n = 1024
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
 * @returns {Promise}
 */
Wallet.prototype.createAccount = function (params) {

  // 1. create key pair
  const keys = keystore.createKeys()

  const public_key = BTCryptTool.buf2hex(keys.publicKey)
  // 2. pack params
  let fetchParams = {
    account_name: params.account,
    public_key,
  }

  console.log('fetchParams', fetchParams);

  // 3. try to register on chain
  return this._requestManager.request('/wallet/createaccount', fetchParams).then(res => res.json()).then(res => {
    console.log('createaccount res: ', res)
    if (res.errcode == 0) {
      return this.createKeystore({
        account: params.account,
        password: params.password,
        privateKey: keys.privateKey
      })
    } else {
      throw new Error("createAccount error: ", res)
    }
  })

}


/**
 * register account on chain
 * @param {Object} params - the params
 * @param {string} params.account - account
 * @param {string|Uint8Array} params.publicKey - the publicKey provided by the account
 * @param {Object} referrerInfo - the referrer
 * @param {string} referrerInfo.account - referrer's account
 * @param {string|Uint8Array} referrerInfo.privateKey - referrer's privateKey
 * @returns {Promise}
 */
Wallet.prototype.registerAccount = function (params, referrerInfo) {

    // 1. create key pair
    const keys = keystore.createKeys()

    // 2. pack params
    let __params = {
      account: params.account,
      publicKey: params.publicKey,
      referrer: referrerInfo.referrer
    }
    let originFetchTemplate = getRegisterFetchTemplate(__params)
    let privateKey = referrerInfo.privateKey
    let fetchTemplate = this.processFetchTemplate(originFetchTemplate, blockHeader, privateKey)

    // 3. try to register on chain
    return this._requestManager.request('/transaction/send', fetchTemplate).then(res => res.json())

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
 * @param {string|Uint8Array} [params.privateKey] - privateKey
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
  console.log('this._requestManager', this._requestManager)
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
