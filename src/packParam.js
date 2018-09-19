const {BasicPack} = require('bottos-js-msgpack')
const Abi = require('../Abi.js')

const basicType = ['string', 'uint8', 'uint16', 'uint32', 'uint64', 'uint256']

/**
 * if the type is the basic type
 * return true
 * otherwise return false
 * @param  {string}  type data type
 * @returns {boolean}
 */
function isBasicType(type) {
  return basicType.includes(type)
}

function packByType(type, value) {
  switch (type) {
    case 'string':
      return BasicPack.PackStr16(value)
    case 'uint8':
      return BasicPack.PackUint8(value)
    case 'uint16':
      return BasicPack.PackUint16(value)
    case 'uint32':
      return BasicPack.PackUint32(value)
    case 'uint64':
      return BasicPack.PackUint64(value)
    case 'uint256':
      return BasicPack.PackUint256(value)
    default:
      return console.error('Invalid type', type);
  }
}

/**
 * [_findFieldsFromStructsByName description]
 * @private
 * @param       {Array} structs [description]
 * @param       {String} name    [description]
 * @return      {Object}         [description]
 */
function _findFieldsFromStructsByName(structs, name) {
  return structs.find(strc => strc.name == name).fields
}

/**
 * [_findStructNameFromActionsByMethod description]
 * @private
 * @param       {Array} actions [description]
 * @param       {String} method  [description]
 * @return      {String}         [description]
 */
function _findStructNameFromActionsByMethod(actions, method) {
  const action = actions.find(act => act.action_name == method)
  if (action) return action.type
  throw new Error('Can not find method: ' + method + ' in build in Abi.')
}

/**
 * @private
 * @param {string} name 
 * @param {Object} param 
 * @param {Array} structs 
 * @returns {Array} array
 */
function _packParamToArr(name, param, structs) {

  let fields = _findFieldsFromStructsByName(structs, name)

  const keys = Object.keys(fields)

  var array = Array.from(BasicPack.PackArraySize(keys.length))

  // console.log('array', array);

  for (let key of keys) {
    let type = fields[key]

    if (isBasicType(type)) {
      // 是基础类型，直接 pack
      let value = param[key]
      if (value == undefined) {
        return console.error('Type error: expected key ' + key + ', but not found.', param)
      }

      let _packedArr = packByType(type, value)
      // console.log('type, value', type, value);
      // console.log('_packedArr', _packedArr);
      array = array.concat(Array.from(_packedArr))
    } else {

      let param2 = param[key] || param.basic_info || param.info

      // console.log('fields2, param2', fields2, param2);

      let childArr = _packParamToArr(type, param2, structs)
      // console.log('childArr', childArr);
      array = array.concat(childArr)
    }

  }

  return array;

}

/**
 * the Second step
 * @param  {Object} param    [description]
 * @param  {Object} abi    [description]
 * @param  {String} method [description]
 * @return {Array}        [description]
 */
function packParamWithABIandMethod(param, abi, method) {
  const { actions, structs } = abi
  let name = _findStructNameFromActionsByMethod(actions, method)
  return _packParamToArr(name, param, structs);
}


function packParamToParamArr(fetchTemplate, abi = Abi) {
  const { contract, method } = fetchTemplate
  const param = fetchTemplate.param
  return packParamWithABIandMethod(param, abi, method);
}

// module.exports.packParamWithABIandMethod = packParamWithABIandMethod
module.exports = packParamToParamArr
