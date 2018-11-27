const BTCryptTool = require('bottos-crypto-js');
const sdkFactory = require('./src/index')

const BottosWalletSDK = sdkFactory({
  crypto: BTCryptTool
})

module.exports = BottosWalletSDK