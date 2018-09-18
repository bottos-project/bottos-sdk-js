
const ToolFactory = require('./Tool')
const ApiFactory = require('./Api')
const walletFactory = require('./walletFactory')

const defaultConfig = {
  baseUrl: 'http://192.168.2.178:8689/v1',
  // baseUrl: 'http://127.0.0.1:8689',
  version: '1' // version
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
  this.Api = ApiFactory(config)
  this.Tool = ToolFactory(config, this.Api)
  this.Wallet = walletFactory(this.Tool)
}

module.exports = SDK
