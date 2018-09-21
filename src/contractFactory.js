
/**
 * @private
 */
function contractFactory(Tool) {

  /**
   * @namespace Contract
   */
  const Contract = {}

  /**
   * @async
   * @function Contract.callContract
   * @param {Object} originFetchTemplate 
   * @param {string|Uint8Array} privateKey
   * @returns {Promise<Object>}
   */
  Contract.callContract = function (originFetchTemplate, privateKey) {
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then(fetchTemplate => Tool._Api.request('/transaction/send', fetchTemplate))
      .then(res => res.json())
  }

  return Contract
}

module.exports = contractFactory