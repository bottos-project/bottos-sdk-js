const { coefficient } = require('./const')

function buf2hex(buffer) {
    return Array.prototype.map.call(buffer, function (x) {
        return ('00' + x.toString(16)).slice(-2);
    }).join('');
};

function addBlockHeader(fetchTemplate, blockHeader) {
  return Object.assign({}, fetchTemplate, blockHeader)
}

/**
 * @param {Object} params - the params
 * @param {string} params.account - account
 * @param {string|Uint8Array} params.publicKey - publicKey
 * @param {string} [params.referrer] - referrer
 * @returns {Object} fetchTemplate
 */
function getRegisterFetchTemplate(params) {

  let publicKey = params.publicKey
  if (typeof publicKey != 'string') {
    publicKey = buf2hex(publicKey)
  }

  let param = {
    "name": params.account,
    "pubkey": publicKey
  }

  return {
    sender: params.referrer || "bottos", // referrer or bottos
    method: "newaccount",
    param,
  }

}


const censorwordsArr = require('./censorwords.json')
/**
 * 是否包含敏感词
 * @param  {string} text [description]
 * @return {boolean}      [description]
 */
function hasSensitiveWord(text) {
  if (typeof text != 'string') {
    console.error('Type Error: expected string but ', typeof text);
  }
  for (let word of censorwordsArr) {
    let pattern = new RegExp(word)
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}



function strBytesLength(str) {
  let bytesCount = 0
  for (let i = 0; i < str.length; i++)
  {
    let c = str.charAt(i);
    if (/^[\u0000-\u00ff]$/.test(c)) //匹配双字节
    {
      bytesCount += 1
    }
    else
    {
      bytesCount += 2
    }
  }

  return bytesCount

  // let count = 0;
  // for(var i in str) {
  //   count++
  // }

  // var total = 0,
  //   charCode,
  //   i,
  //   len;
  // for (i = 0, len = str.length; i < len; i++) {
  //   charCode = str.charCodeAt(i);
  //   if (charCode <= 0x007f) {
  //     total += 1;
  //   } else if (charCode <= 0x07ff) {
  //     total += 2;
  //   } else if (charCode <= 0xffff) {
  //     total += 3;
  //   } else {
  //     total += 4;
  //   }
  // }
  
  // return total;
}

/**
 * @param {Object} params
 * @param {string} params.from
 * @param {string} params.to
 * @param {(string|number)} params.value
 * @param {string} [params.memo] 不能超过 32 个字节，并且要过滤敏感词，这里只做长度限制
 * @returns {Object}
 */
function getTransferFetchTemplate(params) {

  const value = params.value * coefficient
  const memo = params.memo || ''
  if (strBytesLength(memo) > 32) {
    throw new Error('The value of transfer param memo is too long')
  }
  if (hasSensitiveWord(memo)) {
    throw new Error('The value of transfer param memo include invalid characters')
  }

  let param = {
    from: params.from,
    to: params.to,
    value: Number.parseInt(value),
    memo: memo
  }

  return {
    sender: params.from,
    method: "transfer",
    param
  }
}


exports.addBlockHeader = addBlockHeader
exports.getRegisterFetchTemplate = getRegisterFetchTemplate
exports.getTransferFetchTemplate = getTransferFetchTemplate
