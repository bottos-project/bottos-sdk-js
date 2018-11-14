const { getRegisterFetchTemplate, getTransferFetchTemplate } = require('../lib/getFetchTemplate.js')

const accountReg = /^[a-z][a-z0-9]{2,20}$/

function walletFactory(config, Tool) {
  const BTCryptTool = config.crypto

  const keystore = BTCryptTool.keystore
  keystore.constants.scrypt.n = 262144

  /**
   * @function Wallet.createAccountByIntro
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


  /**
   * Create public and private key pair
   * @function Wallet.createKeys
   * @returns {Object} keys
   */
  const createKeys = function () {
    let { privateKey, publicKey } = keystore.createKeys()
    // console.log('privateKey, publicKey', {privateKey, publicKey})
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


  Wallet.createAccountByIntro = createKeystore

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
   * @param {number} amount
   * @param {Object} senderInfo
   * @param {string} senderInfo.account
   * @param {(string|Uint8Array)} senderInfo.privateKey
   * @returns {Promise<Object>}
   */
  Wallet.stake = function (amount, senderInfo) {
    const { account, privateKey } = senderInfo
    let originFetchTemplate = {
      method: "stake",
      sender: account,
      param: { amount },
    }
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then((fetchTemplate) => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())
  }

  /**
   * @async
   * @function Wallet.unstake
   * @param {number} amount
   * @param {Object} senderInfo
   * @param {string} senderInfo.account
   * @param {(string|Uint8Array)} senderInfo.privateKey
   * @returns {Promise<Object>}
   */
  Wallet.unstake = function (amount, senderInfo) {
    const { account, privateKey } = senderInfo
    let originFetchTemplate = {
      method: "unstake",
      sender: account,
      param: { amount },
    }
    return Tool.getRequestParams(originFetchTemplate, privateKey)
    .then((fetchTemplate) => Tool._Api.request('/transaction/send', fetchTemplate))
    .then(res => res.json())
  }

  /**
   * @async
   * @function Wallet.claim
   * @param {number} amount
   * @param {Object} senderInfo
   * @param {string} senderInfo.account
   * @param {(string|Uint8Array)} senderInfo.privateKey
   * @returns {Promise<Object>}
   */
  Wallet.claim = function (amount, senderInfo) {
    const { account, privateKey } = senderInfo
    let originFetchTemplate = {
      method: "claim",
      sender: account,
      param: { amount },
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


  return Wallet
}

module.exports = walletFactory
