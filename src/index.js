/**
 * SDK module.
 */
const ApiFactory = require('./Api')
const ToolFactory = require('./Tool')
const walletFactory = require('./walletFactory')
const contractFactory = require('./contractFactory')


const defaultConfig = {
  baseUrl: 'http://127.0.0.1:8689/v1',
  version: 1 // version
}


/**
 * Represents the SDK.
 * @class
 * @param {Object} config
 * @param {string} [config.baseUrl='http://127.0.0.1:8689/v1']
 * @param {number} [config.version=1]
 */
function SDK(config) {
  this.config = Object.assign({}, defaultConfig, config)
  /**
   * See {@link Api}.
   * @instance
   */
  this.Api = ApiFactory(this.config)
  /**
   * See {@link Tool}.
   * @instance
   */
  this.Tool = ToolFactory(this.config, this.Api)
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
