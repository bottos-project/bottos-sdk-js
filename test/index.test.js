const SDK = require('../src')
const BTCryptTool = require('bottos-crypto-js');
const keystore = BTCryptTool.keystore
const { addBlockHeader, getRegisterFetchTemplate, getTransferFetchTemplate } = require('../src/getFetchTemplate.js')
console.log('BTCryptTool', BTCryptTool);

const sdk = new SDK()
console.log('sdk', sdk);


function test() {

  const keys = sdk.wallet.createKeys()
  // console.log('公私钥对 keys: ', keys)

  const account = 'testtest'

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

  let accountParams = {
    account,
    password: 'afafafaf',
    // referrer: '',
  }

  function __createAccount(params) {

    return this._requestManager.getBlockHeader()
      .then((blockHeader) => {

        // let blockHeader = {
        //   "cursor_num": 1,
        //   "cursor_label": 1095661805,
        //   "lifetime": 1536914875,
        // }
        // 1. create key pair
        const keys = BTCryptTool.createPubPrivateKeys() // 有问题
        console.log('keys', keys)
        console.log('publicKeyStr', BTCryptTool.buf2hex(keys.publicKey))
        console.log('privateKeyStr', BTCryptTool.buf2hex(keys.privateKey))

        // 2. pack params
        let __params = {
          account: params.account,
          // publicKey: keys.publicKey,
          // publicKey: BTCryptTool.buf2hex(keys.publicKey),
          publicKey: "0454f1c2223d553aa6ee53ea1ccea8b7bf78b8ca99f3ff622a3bb3e62dedc712089033d6091d77296547bc071022ca2838c9e86dec29667cf740e5c9e654b6127f", // 传家的
          // publicKey: "04b21be58969e0fce3deecbfd6631eea2f4cd8cc0e89d958469b1964d8c80870b8226508ab819d503cb35a22e5e80979dead1eeec47c24248322f7b9758fe7c8dd",
          referrer: params.referrer
        }
        let originFetchTemplate = getRegisterFetchTemplate(__params)
        // let privateKey = keys.privateKey
        // let privateKey = BTCryptTool.buf2hex(keys.privateKey)
        let privateKey = "b799ef616830cd7b8599ae7958fbee56d4c8168ffd5421a16025a398b8a4be45" // 传家的
        // let privateKey = "f7bb2ea3d5af15ef45f064bf0758c2ce1d506566d951457e2cb2d386b8b66907"
        let fetchTemplate = this.processFetchTemplate(originFetchTemplate, blockHeader, privateKey)
    
        // console.log('fetchTemplate.signature', fetchTemplate.signature)
        // console.log('fetchTemplate.signature', keystore.str2buf(fetchTemplate.signature))
        
        // 3. try to register on chain
        return this._requestManager.request('/transaction/send', fetchTemplate).then(res => res.json()).then(res => {
          // console.log('createAccount res: ', res)
          return res
        })
      })

  }

  __createAccount.call(sdk.wallet, accountParams)
  // sdk.wallet.createAccount(accountParams)
  // .then(res => {
  //   console.log('register res: ', res)
  //   return res
  // })


  // 转账测试
  let params = {
    from: 'aaa',
    to: 'bbb',
    value: '100',
  }
  // sdk.wallet.sendTransaction(params, keys.privateKey)
  //   .then(res => {
  //     console.log('register res: ', res)
  //     return res
  //   })

}

test()