
const RequestManager = require('./requestmanager')
const Wallet = require('./wallet')

const defaultConfig = {
  baseUrl: 'http://192.168.2.178:8689',
  // baseUrl: 'http://127.0.0.1:8689',
  version: 'v1' // version
}

/**
 * Represents the SDK.
 * @constructor
 * @param {Object} config
 * @param {string} config.baseUrl
 * @param {string} config.version
 */
function SDK(config = defaultConfig) {
  this.config = config
  this._requestManager = new RequestManager(config);
  this.wallet = new Wallet(this._requestManager)
}

if (process.env.NODE_ENV != 'development') {
  if (typeof window === 'object') {
    window.BottosWalletSDK = SDK
  } else if (typeof global == 'object') {
    global.BottosWalletSDK = SDK
  }
}


module.exports = SDK
