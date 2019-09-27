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

    /**
     * @function registerAccount
     * @param {string} account - create name.
     * @param {string} publicKey - public key.
     */
    this.registerAccount = function (account, publicKey) {

        // 检查account 是否已被注册[调用查看账号详情]
        return this.Tool._Api.request("/account/info",{account_name: account})
        .then(response=>response.json())
        .then(response=>{

            // 该账号已被注册
            if(response.errcode == 0){
                throw new Error('account already')
            } 
            
            // 创建账号
            else {
                return this.Tool._Api.anyRequest("http://wallet.chainbottos.com:6869/v1/wallet/createaccount",{
                        // 账号名称
                        account_name: account,

                        // 账号公钥
                        public_key: publicKey,

                        // 引荐人账号
                        referrer: "bottosreferrer1"
                }).then(response=>response.json())
                .then(response=>{
                    if(response.errcode == 0) {

                        // 设置账号数据变量
                        return {
                            account: account,
                            publicKey: publicKey
                        }
                    } else {
                        throw new Error('account regist faild')
                    }
                })
            }
        }).then(data=>{
            return data
        })
        .catch(error=>{
            // 账号已注册
            if (error.message === 'account already') {
                throw new Error('create account already exists')
            }
            // 其他类型
            else {
                throw new Error('create account falid')
            }
        }) 
    }

    /**
     * @function getAccountInfo
     * @param {string} account - create name.
     */
    this.getAccountInfoByName = function (account) {
        // 正试地址：http://183.2.169.208:8689
        // 测试地址：http://139.219.128.232:8689
        // 检查account 是否已被注册[调用查看账号详情]
        return this.Tool._Api.request("/account/info",{account_name:account}).then(response=>response.json())
        .then(response => {
            if( !(response && response.errcode == 0) ){
                throw new Error("account not find")
            } else {
                return response
            }
        })
    }

    this.getAccountInfoByPublickey = function (pubkey) {
        return this.Tool._Api.anyRequest("http://125.94.34.23:8080/getPubAccount", {pubkey:pubkey})
        .then(response=>response.json())
        .then(response=>{
            
            if(response && response.success){
                return response.data
            }else{
                throw new Error('account not find')
            }
        })
    }
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
