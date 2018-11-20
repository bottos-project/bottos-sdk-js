# Bottos JavaScript API

You need to run a local Bottos node to use this library.

The SDK supports below features:

1. wallet creation
2. smart contract calling
3. smart contract deplyment
4. Transaction, stake
5. connection management to chain (to do)


[Documentation](https://github.com/bottos-project/bottos-sdk-js/wiki/API-Document)

## Installation

### Node.js

#### If you use npm
```shell
npm install bottos-sdk-js --save
```

#### or yarn

```shell
yarn add bottos-sdk-js
```

## Usage

In node:
```js
var BottosWalletSDK = require('bottos-sdk-js');
```

In browers:
```html
<script src="path/to/bottos-sdk-js.min.js"></script>
```

### file
You can find the bottos-sdk-js.min.js file on [release page](https://github.com/bottos-project/bottos-sdk-js/releases)

Then:
```js
const sdk = new BottosWalletSDK({
    baseUrl: "http://localhost:8689/v1"
});
const Wallet = sdk.Wallet
```

There you go, now you can use it:

```js
const Keypairs = Wallet.createKeys()

console.log('Keypairs', Keypairs)
```

Send a transaction:
```js

const params = {
  from: 'testaccount1',
  to: 'testaccount2',
  value: 100,
}
let privateKey = 'b4e0391643ff9be326a6ddfa543df0e0c2e37b7e11ed2f45590c62a5d5f09d9f'

Wallet.sendTransaction(params, privateKey)
  .then(res => {
    console.log('sendTransaction res:', res)
  })
```

You can find more examples in the [`example`](https://github.com/bottos-project/bottos-sdk-js/tree/master/example) directory.
