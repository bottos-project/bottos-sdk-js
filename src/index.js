const BTCrypto = require('bottos-crypto-js');
const msgpack = require('bottos-js-msgpack');


const RequestManager = require('./requestmanager')
const Wallet = require('./wallet')

console.log('BTCrypto', BTCrypto);
console.log('msgpack', msgpack);

const defaultConfig = {
  baseUrl: 'http://127.0.0.1:8689',
  version: 'v1' // version
}

function SDK(config = defaultConfig) {
  this.config = config
  this._requestManager = new RequestManager(config);
  this.wallet = new Wallet(this._requestManager)
}

const sdk = new SDK()
console.log('sdk', sdk);


function test() {
  
  const keys = sdk.wallet.createKeys()
  console.log('公私钥对 keys: ', keys)

  const account = 'adfa'

  // sdk._requestManager.getAbi('bottos').then(res => {
  //   console.log('bottos contract abi: ', res)
  // })
  
  // const keystoreParam = {
  //   account: 'adfa',
  //   password: 'afafafaf',
  //   privateKey: keys.privateKey
  // }
  // const keystore = sdk.wallet.createKeystore(keystoreParam)
  // console.log('keystore: ', keystore)

  // const pk = sdk.wallet.recoverKeystore(keystoreParam.password, keystore)
  // console.log('pk: ', pk)

  sdk.wallet.createAccount(account, keys)
    .then(res => {
      console.log('register res: ', res)
      return res
    })


  // 转账测试
  let params = {
    from: 'aaa',
    to: 'bbb',
    value: '100',
  }
  sdk.wallet.sendTransaction(params, keys)
    .then(res => {
      console.log('register res: ', res)
      return res
    })

}

test()