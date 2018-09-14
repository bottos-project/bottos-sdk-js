const path = require('path')

module.exports = {
  entry: './src/index.js',

  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },

  mode: 'development',

  devServer: {
    // contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};