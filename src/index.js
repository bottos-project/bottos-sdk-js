/**
 * BottosWalletSDK module.
 */
/**
 * @private
 */
const ApiFactory = require('./Api')
const ToolFactory = require('./Tool')
const walletFactory = require('./walletFactory')
const contractFactory = require('./contractFactory')


function sdkFactory(config) {

  let { crypto, fetch } = config

  const defaultConfig = {
    baseUrl: 'http://localhost:8689/v1',
    version: 1, // version
    crypto,
    fetch
  }

  /**
   * Represents the BottosWalletSDK.
   * @class
   * @param {Object} config
   * @param {string} [config.baseUrl=http://localhost:8689/v1]
   * @param {number} [config.version=1]
   * @param {Object} [config.crypto=BTCryptTool]
   */
  function BottosWalletSDK(config) {
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
    this.Wallet = walletFactory(this.config, this.Tool)
    /**
     * See {@link Contract}.
     * @instance
     */
    this.Contract = contractFactory(this.Tool)
  }

  /**
   * @function BottosWalletSDK#setBaseUrl
   * @param {string} baseUrl - The baseUrl used in request.
   */
  BottosWalletSDK.prototype.setBaseUrl = function(baseUrl) {
    this.config.baseUrl = baseUrl
  }

  /**
   * Update the chain_id manual.
   * @function BottosWalletSDK#updateChainId
   */
  BottosWalletSDK.prototype.updateChainId = function() {
    this.Api.getBlockHeader()
  }

  return BottosWalletSDK
}

module.exports = sdkFactory
