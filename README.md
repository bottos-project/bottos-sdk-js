# bottos-sdk-js

<a name="BottosWalletSDK"></a>

## BottosWalletSDK
**Kind**: global class

* [BottosWalletSDK](#BottosWalletSDK)
    * [.Api](#BottosWalletSDK+Api)
    * [.Tool](#BottosWalletSDK+Tool)
    * [.Wallet](#BottosWalletSDK+Wallet)
    * [.Contract](#BottosWalletSDK+Contract)

<a name="new_BottosWalletSDK_new"></a>

### new BottosWalletSDK(config)
Represents the BottosWalletSDK.


| Param | Type | Default |
| --- | --- | --- |
| config | <code>Object</code> |  |
| [config.baseUrl] | <code>string</code> | <code>&quot;http://127.0.0.1:8689/v1&quot;</code> |
| [config.version] | <code>number</code> | <code>1</code> |

<a name="BottosWalletSDK+Api"></a>

### bottosWalletSDK.Api
See [Api](Api).

**Kind**: instance property of [<code>BottosWalletSDK</code>](#BottosWalletSDK)
<a name="BottosWalletSDK+Tool"></a>

### bottosWalletSDK.Tool
See [Tool](Tool).

**Kind**: instance property of [<code>BottosWalletSDK</code>](#BottosWalletSDK)
<a name="BottosWalletSDK+Wallet"></a>

### bottosWalletSDK.Wallet
See [Wallet](Wallet).

**Kind**: instance property of [<code>BottosWalletSDK</code>](#BottosWalletSDK)
<a name="BottosWalletSDK+Contract"></a>

### bottosWalletSDK.Contract
See [Contract](Contract).

**Kind**: instance property of [<code>BottosWalletSDK</code>](#BottosWalletSDK)

---

## Typedefs

<dl>
<dt><a href="#functionCallback">functionCallback</a> : <code>function</code></dt>
<dd><p>This callback is displayed as a global member.</p>
</dd>
</dl>

<a name="Api"></a>

## Api : <code>object</code>
**Kind**: global namespace

* [Api](#Api) : <code>object</code>
    * [.chain_id](#Api.chain_id)
    * [.getAbi(contract, [callback])](#Api.getAbi) ⇒ <code>Promise</code> \| <code>undefined</code>
    * [.getBlockHeader([callback])](#Api.getBlockHeader) ⇒ <code>Promise</code> \| <code>undefined</code>

<a name="Api.chain_id"></a>

### Api.chain_id
Documented as Api.chain_id

**Kind**: static property of [<code>Api</code>](#Api)
<a name="Api.getAbi"></a>

### Api.getAbi(contract, [callback]) ⇒ <code>Promise</code> \| <code>undefined</code>
Returns the abi. If callback is undefined, this function will return a promise.

**Kind**: static method of [<code>Api</code>](#Api)

| Param | Type | Description |
| --- | --- | --- |
| contract | <code>string</code> | The contract name. |
| [callback] | [<code>functionCallback</code>](#functionCallback) | The optional callback. |

<a name="Api.getBlockHeader"></a>

### Api.getBlockHeader([callback]) ⇒ <code>Promise</code> \| <code>undefined</code>
Documented as Api.getBlockHeader.

**Kind**: static method of [<code>Api</code>](#Api)
**Returns**: <code>Promise</code> \| <code>undefined</code> - If callback is undefined, a promise will be returned.

| Param | Type |
| --- | --- |
| [callback] | [<code>functionCallback</code>](#functionCallback) |

<a name="functionCallback"></a>

## functionCallback : <code>function</code>
This callback is displayed as a global member.

**Kind**: global typedef

| Param | Type | Description |
| --- | --- | --- |
| err | <code>\*</code> | The callback error. |
| result | <code>\*</code> | The success result. |




