
const querystring = require('querystring')

/**
 * This callback is displayed as a global member.
 * @callback functionCallback
 * @param {*} err - The callback error.
 * @param {*} result - The success result.
 */

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
  // the only reliable means to get the global object is
  // `Function('return this')()`
  // However, this causes CSP violations in Chrome apps.
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
}

/**
 * @ignore
 * @param {Object} config
 * @param {string} config.baseUrl
 * @param {number} config.version
 * @param {Function} [config.fetch]
 */
function ApiFactory(config) {
  let global = getGlobal();

  var _fetch = config.fetch || global.fetch // In browser and React-Native

  /**
   * @function Api.request
   * @param {string} url
   * @param {Object} params
   * @param {string} [method=POST]
   * @returns {Promise<Response>}
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
      return _fetch(config.baseUrl + url + paramStr, CORSOptions)
    }

    let __options = {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   contentType: 'application/json'
      // },
      body: JSON.stringify(params)
    }

    return _fetch(config.baseUrl + url, __options)
  }

  /**
   * @function Api.request
   * @param {string} url
   * @param {Object} params
   * @param {string} [method=POST]
   * @returns {Promise<Response>}
   */
  function anyFetch(url, params, method = 'POST') {

    if (method.toUpperCase() == 'GET') {
      let paramStr = ''
      if (params && typeof params == 'object') {
        paramStr = '?' + querystring.stringify(params)
      }

      const CORSOptions = {
        method: 'GET',
        mode: 'cors',
      }
      return _fetch(config.baseUrl + url + paramStr, CORSOptions)
    }

    let __options = {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   contentType: 'application/json'
      // },
      body: JSON.stringify(params)
    }

    return _fetch(url, __options)
  }


  /**
   * Returns the abi.
   * @function Api.getAbi
   * @param {string} contract - The contract name.
   * @returns {Promise<(Object|null)>}
   */
  function getAbi(contract) {
    const url = '/contract/abi'
    return simpleFetch(url, { contract })
    .then(res => res.json())
    .catch(err => {
      // console.dir(err)
      if (err.message.startsWith('Unexpected token { in JSON')) {
        return { "errcode": 0, "msg": "success", "result": null }
      }
    })
    .then(res => {
      // console.log('getAbi res', res)
      if (!res) {
        throw new Error('Get abi error.')
      } else if (res.errcode != 0) {
        throw res
      } else {
        // 成功，现在有两个情况
        // 1. 如果是 bottos，直接返回 result
        if (contract == 'bottos') { return res.result }
        // 2. 如果不是 bottos，就是请求的外置合约的 ABI
        try {
          return JSON.parse(res.msg)
        } catch (error) {
          return res.result
        }
      }
    })
  }

  /**
   * Documented as Api.getBlockHeader.
   * @function Api.getBlockHeader
   * @param {functionCallback} [callback]
   * @returns {Promise<Object>|undefined} If callback is undefined, a promise will be returned.
   */
  function getBlockHeader(callback) {
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
          config.version = data.head_block_version
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
        config.version = data.head_block_version
        result = __blockHeader
      }
      cb(err, result)
    })
    .catch(err => cb(err))
  }

  /**
   * @namespace Api
   */
  const Api = {
    /** Documented as Api.chain_id */
    chain_id: "7e16479f12fafb52696b31c31a8fdbafc527a9c8d5b4a8cfb222d5304ad92ed0",
    request: simpleFetch,
    getAbi,
    getBlockHeader,
    anyRequest: anyFetch
  }

  return Api
}

module.exports = ApiFactory