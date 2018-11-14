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

```bash
npm install bottos-sdk-js
```

### Yarn

```bash
yarn add bottos-sdk-js
```

### file

You can find the bottos-sdk-js.min.js file on [release page](https://github.com/bottos-project/bottos-sdk-js/releases)


## Usage

In node:
```js
var BottosWalletSDK = require('bottos-sdk-js');
```

In browers:
```html
<script src="path/to/bottos-sdk-js.min.js"></script>

```

Then:
```js
var sdk = new BottosWalletSDK({
    baseUrl: "http://localhost:8689/v1"
});

```

There you go, now you can use it:

```js
const Keypairs = Wallet.createKeys()

console.log('Keypairs', Keypairs)
```

You can find more examples in the [`example`](https://github.com/bottos-project/bottos-sdk-js/tree/master/example) directory.
