const BTCryptTool = require('bottos-crypto-js');

const keystore = BTCryptTool.keystore
keystore.constants.scrypt.n = 1024
const { getRegisterFetchTemplate, getTransferFetchTemplate } = require('../lib/getFetchTemplate.js')

/**
 * @private
 * @param {Object} params - the params required for create keystore
 * @param {string} params.account - account
 * @param {string} params.password - password
 * @param {string|Uint8Array} [params.privateKey] - privateKey
 * @returns {Object} keystore
 */
const createKeystore = function (params) {
  const account = params.account,
    password = params.password,
    privateKey = params.privateKey
  return keystore.create({ account, password, privateKey })
}


function walletFactory(Tool) {

  /**
   * Wallet namespace
   * @namespace Wallet
   */
  const Wallet = {}

  /**
   * create account
   * Refer to this by {@link Wallet.createAccount}.
   * @memberof Wallet
   * @param {Object} params - the params
   * @param {string} params.account - account
   * @param {string} params.password - password
   * @param {Function} [callback] - callback
   * @returns {Promise}
   */
  Wallet.createAccount = function (params, callback) {
    const cb = callback
    // 1. create key pair
    const keys = keystore.createKeys()

    const public_key = BTCryptTool.buf2hex(keys.publicKey)
    // 2. pack params
    let fetchParams = {
      account_name: params.account,
      public_key,
    }

    // console.log('fetchParams', fetchParams);

    // 3. try to register on chain
    let promise = Tool._Api.request('/wallet/createaccount', fetchParams)
    .then(res => res.json())

    if (!cb) return promise.then(res => {
      var err = null
      if (!res) {
        err = new Error('createAccountWithIntro error')
      } else if (res.errcode != 0) {
        err = res
      }
      if (err) throw err

      // console.log('createaccount res: ', res)
      let keystoreObj = createKeystore({
        account: params.account,
        password: params.password,
        privateKey: keys.privateKey
      })

      return keystoreObj

    })

    promise.then(res => {
      var err = null, result;
      if (!res) {
        err = new Error('createAccountWithIntro error')
      } else if (res.errcode != 0) {
        err = res
      } else {
        // console.log('createaccount res: ', res)
        result = createKeystore({
          account: params.account,
          password: params.password,
          privateKey: keys.privateKey
        })

      }
      cb(err, result)
    })
    .catch(err => cb(err))

  }


  /**
   * register account on chain
   * @memberof Wallet
   * @param {Object} params - The params
   * @param {string} params.account - The new user's account
   * @param {string|Uint8Array} params.publicKey - The publicKey provided by the new user
   * @param {Object} referrerInfo - The referrer
   * @param {string} referrerInfo.account - referrer's account
   * @param {string|Uint8Array} referrerInfo.privateKey - referrer's privateKey
   * @returns {Promise}
   */
  Wallet.createAccountWithIntro = function (params, referrerInfo) {
    // 1. pack params
    let __params = {
      account: params.account,
      publicKey: params.publicKey,
      referrer: referrerInfo.account
    }
    let originFetchTemplate = getRegisterFetchTemplate(__params)
    let privateKey = referrerInfo.privateKey
    
    // 2. try to register on chain
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then(fetchTemplate => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())
      .then(res => {
        if (!res) {
          throw new Error('createAccountWithIntro error')
        } else if (res.errcode != 0) {
          throw new Error(res.msg)
        } else {
          return res
        }
      })

  }

  /**
   * register account on chain
   * @function
   * @public
   * @memberof Wallet
   * @param {Object} params - The params
   * @param {string} params.account - The new user's account
   * @param {string} params.password - password
   * @param {string|Uint8Array} params.privateKey - The publicKey provided by the new user
   * @returns {Promise}
   */
  Wallet.createAccountByIntro = createKeystore

  /**
   * @public
   * Create public and private key pair
   * @returns {Object} keys
   */
  Wallet.createKeys = function () {
    let keys = keystore.createKeys()
    return keys
  }

  // account: "adfa",
  // crypto: { cipher: "aes-128-ctr", ciphertext: "54f831f74056a683f758c27df56cf460671fae59549894aa4fb4a9935d0eccd6", cipherparams: { … }, mac: "0300f99245dea92dfe22dcc083ebe171f1c172871b4686a03b03e272c0139253", kdf: "scrypt", … },
  // id: "12f16bd2-3d1e-4dfd-98d9-b1124c9d084b",
  // version: 3,

  /**
   * @public
   * @param {string} password - password
   * @param {Object} keyObject - the keystore
   * @returns {ArrayBuffer} privateKey - privateKey
   */
  Wallet.recover = keystore.recover.bind(keystore)

  /**
   * private method
   */
  // Wallet.signTransaction = function() {

  // }



  Wallet.getAccountInfo = function (account_name) {
    return Tool._Api.request('/account/info', { account_name }).then(res => res.json())
  }

  /**
   *
   * @param {Object} params
   * @param {string} params.from
   * @param {string} params.to
   * @param {string|number} params.value
   * @param {string|Uint8Array} privateKey
   */
  Wallet.sendTransaction = function (params, privateKey) {
    let promise = Tool._Api.getBlockHeader()
    return promise.then((blockHeader) => {
      let originFetchTemplate = getTransferFetchTemplate(params)

      let fetchTemplate = processFetchTemplate(originFetchTemplate, blockHeader, privateKey)

      return Tool._Api.request('/transaction/send', fetchTemplate)
        .then(res => res.json())
        .then(res => {
          if (!res) {
            throw new Error('createAccountWithIntro error')
          } else if (res.errcode != 0) {
            throw new Error(res.msg)
          } else {
            return res
          }
        })

    })

  }

  return Wallet

}

module.exports = walletFactory
