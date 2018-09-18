
const querystring = require('querystring')

  /**
   * @param {Object} config 
   * @param {string} config.baseUrl
   * @param {string} config.version
   */
function ApiFactory(config) {

  /**
   * 
   * @param {string} url 
   * @param {Object} params 
   * @param {string} method 
   */
  function simpleFetch(url, params, method = 'POST') {
    // console.log(' simpleFetch, url, params: ', url, params)
  
    if (method.toUpperCase() == 'GET') {
      let paramStr = ''
      if (params && typeof params == 'object') {
        paramStr = '?' + querystring.stringify(params)
      }
  
      const CORSOptions = {
        method: 'GET',
        mode: 'cors',
      }
      return fetch(config.baseUrl + url + paramStr, CORSOptions)
    }
  
    let __options = {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   contentType: 'application/json'
      // },
      body: JSON.stringify(params)
    }
  
    return fetch(config.baseUrl + url, __options)
  }
  

  const Api = {
    chain_id: "4b97b92d2c78bcffe95ebd3067565c73a2931b39d5eb7234b11816dcec54761a"
  }
  
  Api.request = simpleFetch
  
  /**
   * Returns the abi 
   * @param {string} contract 
   */
  Api.getAbi = function (contract) {
    const url = '/contract/abi'
    return simpleFetch(url, { contract }).then(res => res.json()).then(res => {
      if (!res || res.errcode != 0) {
        throw new Error('abi error', res)
      }
      return JSON.parse(res.result)
    })
  }


  /**
   * @returns {Object} blockHeader
   */
  Api.getBlockHeader = function () {
    return simpleFetch('/block/height', null, 'GET')
      .then(res => res.json())
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

  return Api
}

module.exports = ApiFactory