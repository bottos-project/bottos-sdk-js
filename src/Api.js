
const querystring = require('querystring')

/**
 * This callback is displayed as a global member.
 * @callback functionCallback
 * @param {*} err - The callback error.
 * @param {*} result - The success result.
 */

/**
 * @namespace Api
 */
const Api = {
  /** Documented as Api.chain_id */
  chain_id: "4b97b92d2c78bcffe95ebd3067565c73a2931b39d5eb7234b11816dcec54761a"
}

/**
 * @ignore
 * @param {Object} config 
 * @param {string} config.baseUrl
 * @param {number} config.version
 */
function ApiFactory(config) {

  /**
   * @function Api.request
   * @param {string} url
   * @param {Object} params 
   * @param {string} [method=POST] 
   */
  function simpleFetch(url, params, method = 'POST') {
  
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


  Api.request = simpleFetch
  
  /**
   * Returns the abi. If callback is undefined, this function will return a promise.
   * @function Api.getAbi
   * @param {string} contract - The contract name.
   * @param {functionCallback} [callback] - The optional callback.
   * @returns {Promise<Object>|undefined}
   */
  Api.getAbi = function (contract, callback) {
    const cb = callback
    const url = '/contract/abi'
    let promise = simpleFetch(url, { contract }).then(res => res.json())
    
    if (!cb) {
      return promise.then(res => {
        if (!res) {
          throw new Error('Get abi error.')
        } else if (res.errcode != 0) {
          throw res
        } else {
          return JSON.parse(res.result)
        }
      })
    }
    promise.then(res => {
      var err = null, result;
      if (!res) {
        err = new Error('Get abi error.')
      } else if (res.errcode != 0) {
        err = res
      } else {
        result = JSON.parse(res.result)
      }
      cb(err, result)
    })
    .catch(err => cb(err))

  }


  /**
   * Documented as Api.getBlockHeader.
   * @function Api.getBlockHeader
   * @param {functionCallback} [callback]
   * @returns {Promise<Object>|undefined} If callback is undefined, a promise will be returned.
   */
  Api.getBlockHeader = function (callback) {
    const cb = callback
    let promise = simpleFetch('/block/height', null, 'GET')
      .then(res => res.json())

    if (!cb) {
      return promise.then(res => {
        if (!res) {
          throw new Error('Get BlockHeader error.')
        } else if (res.errcode != 0) {
          throw res
        } else {
          let __blockHeader = {}
          let data = res.result
          __blockHeader.cursor_label = data.cursor_label
          __blockHeader.cursor_num = data.head_block_num
          __blockHeader.lifetime = data.head_block_time + 300
          // set chain_id
          this.chain_id = data.chain_id
          return __blockHeader
        }
      })
    }
    
    promise.then((res) => {
      var err = null, result;
      if (!res) {
        err = new Error('Get BlockHeader error.')
      } else if (res.errcode != 0) {
        err = res
      } else {
        let __blockHeader = {}
        let data = res.result
        __blockHeader.cursor_label = data.cursor_label
        __blockHeader.cursor_num = data.head_block_num
        __blockHeader.lifetime = data.head_block_time + 300
        // set chain_id
        this.chain_id = data.chain_id
        result = __blockHeader
      }
      cb(err, result)
    })
    .catch(err => cb(err))
  }

  return Api
}


module.exports = ApiFactory