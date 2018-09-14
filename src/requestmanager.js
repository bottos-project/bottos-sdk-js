
const querystring = require('querystring')

function parseJSON(res) {
  return res.json()
}

/**
 * 
 * @param {string} url 
 * @param {Object} params 
 * @param {string} method 
 */
function fetchFactory(url, params, method = 'POST') {
  // console.log(' fetchFactory, url, params: ', url, params)

  if (method.toUpperCase() == 'GET') {
    let paramStr = ''
    if (params && typeof params == 'object') {
      paramStr = '?' + querystring.stringify(params)
    }
    
    const CORSOptions = {
      method: 'GET',
      mode: 'cors',
    }
    return fetch(this.prefix + url + paramStr, CORSOptions)
  }

  let __options = {
    method: 'POST',
    mode: 'cors',
    // headers: {
    //   contentType: 'application/json'
    // },
    body: JSON.stringify(params)
  }

  return fetch(this.prefix + url, __options)
}

/**
 * @constructor
 * @param {Object} config 
 * @param {string} config.baseUrl
 * @param {string} config.version
 */
function RequestManager(config) {
  this.prefix = config.baseUrl + '/' + config.version
  this.chain_id = "4b97b92d2c78bcffe95ebd3067565c73a2931b39d5eb7234b11816dcec54761a"
}

RequestManager.prototype.request = fetchFactory

/**
 * @returns {Object} blockHeader
 */
RequestManager.prototype.getBlockHeader = function () {
  return this.request('/block/height', null, 'GET')
    .then(parseJSON)
    .then((res) => {
      // console.log('res', res)
      if (!(res && res.errcode == 0)) {
        throw new Error('GetBlockHeader error')
      }
      let __blockHeader = {}
      let data = res.result
      __blockHeader.cursor_label = data.cursor_label
      __blockHeader.cursor_num = data.head_block_num
      __blockHeader.lifetime = data.head_block_time + 300
      // set chain_id
      this.chain_id = data.chain_id
      return __blockHeader
    })
}

/**
 * Returns the abi 
 * @param {string} contract 
 */
RequestManager.prototype.getAbi = function (contract) {
  const url = '/contract/abi'
  return this.request(url, { contract }).then(parseJSON)
}


module.exports = RequestManager