const path = require('path')

const config = {
  entry: './browser.js',

  output: {
    filename: 'bottos-sdk-js.min.js',
    path: path.resolve(__dirname, 'umd'),
    library: 'BottosWalletSDK',
    libraryTarget: 'umd'
  }
}

module.exports = config;
