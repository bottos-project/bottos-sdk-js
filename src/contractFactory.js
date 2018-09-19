

function contractFactory(Tool) {

  /**
   * @namespace Contract
   */
  const Contract = {}

  /**
   * @memberof Contract
   * @param {Object} originFetchTemplate 
   * @param {string|Uint8Array} privateKey
   */
  Contract.callContract = function (originFetchTemplate, privateKey) {
    return Tool.getRequestParams(originFetchTemplate, privateKey)
      .then(fetchTemplate => Tool._Api.request('/transaction/send', fetchTemplate))
  }

  return Contract
}

module.exports = contractFactory