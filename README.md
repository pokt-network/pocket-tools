# pocket-tools 🪓

[<img src="https://img.shields.io/npm/v/pocket-tools" alt="" />](https://www.npmjs.com/package/pocket-tools) [<img src="https://img.shields.io/bundlephobia/minzip/pocket-tools" alt="" />](https://bundlephobia.com/result?p=pocket-tools)

pocket-tools is a collection of everyday, useful tools for everyone building on the Pocket Network.

## Usage

Add it to your project:

```console
yarn add pocket-tools
```

Use it in your app:

```js
// App.js

import { poktToUpokt } from 'pocket-tools'

const amount = poktToUpokt("8000")
// transfer this amount through pocketJS...
```

## API

### getAddressFromPublicKey(publicKey)

Converts an Application's Public Key into its address equivalent.

##### Parameters

 - `publicKey`: The public key to be converted to its address equivalent. Must be passed as a `string`.

### isAddress(address)

Validates if the given address satisfies the format used on the Pocket Blockchain.
Pocket addresses are not checksummed, so the method to follow is check if its:
1. A valid hex string, AND
2. its length in bytes is 20.

##### Parameters

 - `address`: The address to be verified. Must be passed as a `string`.


### poktToUpokt(quantity)

Converts a normal integer POKT amount to a 6-decimal representation (uPOKT).
Remember that 1 POKT = 1000000 (1M) uPOKT.

##### Parameters

 - `quantity`: The amount to convert. Can be a `string`, `number` or native [`bigint`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt).

