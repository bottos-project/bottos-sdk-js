/**
 * SDK module.
 */

const ApiFactory = require('./Api')
const ToolFactory = require('./Tool')
const walletFactory = require('./walletFactory')
const contractFactory = require('./contractFactory')

/**
 *  @constant
 *  @default
 */
const defaultConfig = {
  baseUrl: 'http://127.0.0.1:8689/v1',
  version: '1' // version
}

/**
 * Represents the SDK.
 * @class
 * @param {Object} [config] 
 * @param {string} config.baseUrl
 * @param {string} config.version
 */
function SDK(config = defaultConfig) {
  this.config = config
  /**
   * See {@link Api}.
   * @instance
   */
  this.Api = ApiFactory(config)
  /**
   * See {@link Tool}.
   * @instance
   */
  this.Tool = ToolFactory(config, this.Api)
  /**
   * See {@link Wallet}.
   * @instance
   */
  this.Wallet = walletFactory(this.Tool)
  /**
   * See {@link Contract}.
   * @instance
   */
  this.Contract = contractFactory(this.Tool)
}

/**
 * myFunction is now MyNamespace#myFunction.
 * @function myFunction
 * @memberof MyNamespace
 * @instance
 */

module.exports = SDK
