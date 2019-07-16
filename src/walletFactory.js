const { getRegisterFetchTemplate, getTransferFetchTemplate } = require('../lib/getFetchTemplate.js')
const { coefficient } = require('../lib/const')


/**
 * A number, or a string containing a number.
 * @typedef {(number|string)} NumberLike
 */

const accountReg = /^[a-z][a-z0-9]{2,20}$/

function walletFactory(config, Tool) {
  const BTCryptTool = config.crypto

  // get keystore object
  const keystore = BTCryptTool.keystore
  keystore.constants.scrypt.n = 262144

  // get mnemonic object
  const mnemonic = BTCryptTool.mnemonic

  /**
   * Create key return private key and public key
   * @function createKeys
   * @returns {Object} keys
   */
  const createKeys = function () {
    let { privateKey, publicKey } = keystore.createKeys()
    return {
      privateKey: BTCryptTool.buf2hex(privateKey),
      publicKey: BTCryptTool.buf2hex(publicKey)
    }
  }

  /**
   * @namespace Wallet
   */
  const Wallet = {}
  Wallet.createKeys = createKeys

  /**
   * @function Wallet.createKeystore
   * @param {Object} params - the params required for create keystore
   * @param {string} params.account - account
   * @param {string} params.password - password
   * @param {(string|Uint8Array)} params.privateKey - privateKey
   * @returns {Object} keystore
   */
  const createKeystore = function (params) {
    const account = params.account,
    password = params.password,
    privateKey = params.privateKey;
    accountReg.test(account)
    if (!accountReg.test(account)) throw new Error('Invalid account ' + account)
    return keystore.create({ account, password, privateKey })
  }

  Wallet.createKeystore = createKeystore
  Wallet.createAccountByIntro = createKeystore

  /**
   * recover keystore return private key and public key
   * @function recoverKeystore
   * @param {String} password
   * @param {Object} keystoreStruct
   * @returns {Object}
   */
  const recoverKeystore = function (password, keystoreStruct) {

    let privateKeyBuffer = keystore.recover(password, keystoreStruct)

    // get private key
    let privateKey = BTCryptTool.buf2hex(privateKeyBuffer)

    // get public key
    let publicKey = BTCryptTool.buf2hex(BTCryptTool.privateKey2pubKey(privateKeyBuffer))

    return {privateKey, publicKey}
  }

  Wallet.recoverKeystore = recoverKeystore


  /**
   * Create mnemonic return mnemonic and private key and public key
   * @function createMnemonic
   * @param {function} cb
   */
  const createMnemonic = function (cb) {

    mnemonic.create((info) => {
      // get private key
      let privateKey = BTCryptTool.buf2hex(info.privateKey)

      // get public key
      let publicKey = BTCryptTool.buf2hex(info.publicKey)

      // action call back
      cb({mnemonic: info.mnemonic, privateKey, publicKey})
    })
  }

  Wallet.createMnemonic = createMnemonic


  /**
   * recover mnemonic return mnemonic and private key and public key
   * @function recoverMnemonic
   * @param {String} text
   * @param {Function} cb
   * @returns {Object}
   */
  const recoverMnemonic = function (text, cb) {
    let data = mnemonic.recover(text, (info) => {
      // get private key
      let privateKey = BTCryptTool.buf2hex(info.privateKey)

      // get public key
      let publicKey = BTCryptTool.buf2hex(info.publicKey)

      // action call back
      cb({privateKey, publicKey})
    })
  }

  Wallet.recoverMnemonic = recoverMnemonic


  /**
   * register account on chain
   * @async
   * @function Wallet.createAccountWithIntro
   * @param {Object} params - The params
   * @param {string} params.account - The new user's account
   * @param {(string|Uint8Array)} params.publicKey - The publicKey provided by the new user
   * @param {Object} referrerInfo - The referrer
   * @param {string} referrerInfo.account - referrer's account
   * @param {(string|Uint8Array)} referrerInfo.privateKey - referrer's privateKey
   * @returns {Promise<Object>}
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
      // .then(res => {
      //   if (!res) {
      //     throw new Error('createAccountWithIntro error')
      //   } else if (res.errcode != 0) {
      //     throw new Error(res.msg)
      //   } else {
      //     return res
      //   }
      // })

  }

  // account: "adfa",
  // crypto: { cipher: "aes-128-ctr", ciphertext: "54f831f74056a683f758c27df56cf460671fae59549894aa4fb4a9935d0eccd6", cipherparams: { … }, mac: "0300f99245dea92dfe22dcc083ebe171f1c172871b4686a03b03e272c0139253", kdf: "scrypt", … },
  // id: "12f16bd2-3d1e-4dfd-98d9-b1124c9d084b",
  // version: 3,

  /**
   * @function Wallet.recover
   * @param {string} password - password
   * @param {Object} keyObject - the keystore
   * @returns {Uint8Array} privateKey
   */
  Wallet.recover = keystore.recover.bind(keystore)

  /**
   * private method
   */
  // Wallet.signTransaction = function() {
  //
  // }


  /**
   * @async
   * @function Wallet.getAccountInfo
   * @param {string} account_name
   * @returns {Promise<Object>}
   */
  Wallet.getAccountInfo = function (account_name) {
    return Tool._Api.request('/account/info', { account_name })
    .then(res => res.json())
    .then(res => {
      if (!res) throw new Error('Get account info error.')
      // if (res.errcode != 0) return res
      return res
    })
  }

  /**
   * @async
   * @function Wallet.sendTransaction
   * @param {Object} params
   * @param {string} params.from
   * @param {string} params.to
   * @param {(string|number)} params.value
   * @param {string} [params.memo] 不能超过 32 个字节，并且要过滤敏感词，这里只做长度限制
   * @param {string} privateKey
   * @returns {Promise<Object>}
   */
  Wallet.sendTransaction = function (params, privateKey) {
    let originFetchTemplate = getTransferFetchTemplate(params)
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then((fetchTemplate) => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())
  }

  /**
   * @async
   * @function Wallet.stake
   * @param {Object} params
   * @param {NumberLike} params.amount
   * @param {string} [params.target=vote] - The target you want to stake for, can set to `vote`, `space` or `time`.
   * @param {Object} senderInfo
   * @param {string} senderInfo.account
   * @param {(string|Uint8Array)} senderInfo.privateKey
   * @returns {Promise<Object>}
   */
  Wallet.stake = function (params, senderInfo) {
    let { amount, target } = params
    target = target ? target : 'vote'
    let value = amount * coefficient
    const { account, privateKey } = senderInfo
    let originFetchTemplate = {
      method: "stake",
      sender: account,
      param: { amount: Number.parseInt(value), target },
    }
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then((fetchTemplate) => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())
  }

  /**
   * @async
   * @function Wallet.unstake
   * @param {Object} params
   * @param {NumberLike} params.amount
   * @param {string} [params.source=vote]
   * @param {Object} senderInfo
   * @param {string} senderInfo.account
   * @param {(string|Uint8Array)} senderInfo.privateKey
   * @returns {Promise<Object>}
   */
  Wallet.unstake = function (params, senderInfo) {
    let { amount, source } = params
    source = source ? source : 'vote'
    let value = amount * coefficient
    const { account, privateKey } = senderInfo
    let originFetchTemplate = {
      method: "unstake",
      sender: account,
      param: { amount: Number.parseInt(value), source },
    }
    return Tool.getRequestParams(originFetchTemplate, privateKey)
    .then((fetchTemplate) => Tool._Api.request('/transaction/send', fetchTemplate))
    .then(res => res.json())
  }

  /**
   * @async
   * @function Wallet.claim
   * @param {NumberLike} amount
   * @param {Object} senderInfo
   * @param {string} senderInfo.account
   * @param {(string|Uint8Array)} senderInfo.privateKey
   * @returns {Promise<Object>}
   */
  Wallet.claim = function (amount, senderInfo) {
    const { account, privateKey } = senderInfo
    let value = amount * coefficient
    let originFetchTemplate = {
      method: "claim",
      sender: account,
      param: { amount: Number.parseInt(value) },
    }
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then((fetchTemplate) => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())
  }


  function votedelegate(delegate, senderInfo, voteop) {
    const { account, privateKey } = senderInfo
    let originFetchTemplate = {
      method: "votedelegate",
      sender: account,
      param: {
        voteop,
        voter: account,
        delegate: delegate
      },
    }
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then((fetchTemplate) => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())
  }

  /**
   * @async
   * @function Wallet.vote
   * @param {string} delegate
   * @param {Object} senderInfo
   * @param {string} senderInfo.account
   * @param {(string|Uint8Array)} senderInfo.privateKey
   * @returns {Promise<Object>}
   */
  Wallet.vote = function (delegate, senderInfo) {
    return votedelegate(delegate, senderInfo, 1)
  }

  /**
   * @async
   * @function Wallet.cancelVote
   * @param {string} delegate
   * @param {Object} senderInfo
   * @param {string} senderInfo.account
   * @param {(string|Uint8Array)} senderInfo.privateKey
   * @returns {Promise<Object>}
   */
  Wallet.cancelVote = function (delegate, senderInfo) {
    return votedelegate(delegate, senderInfo, 0)
  }

  Wallet.privateKey2pubKey = function(privateKey) {
    return BTCryptTool.buf2hex(BTCryptTool.privateKey2pubKey(Buffer.from(privateKey, 'hex')))
  }

  return Wallet
}

module.exports = walletFactory
