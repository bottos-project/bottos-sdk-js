const BTCryptTool = require('bottos-crypto-js');
const fetch = require('node-fetch');

const sdkFactory = require('./src/index')

const BottosWalletSDK = sdkFactory({
  crypto: BTCryptTool,
  fetch
})

module.exports = BottosWalletSDK
