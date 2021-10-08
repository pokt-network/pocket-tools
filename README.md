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

## RPC Methods

### getHeight()

```js
async function getHeight(
  options?: {
    rpcUrl?: string;
  }
): Promise<number>
```

Gets the current block height.

##### Parameters

  - `rpcUrl?`: The RPC URL to use. Defaults to a public, sponsored by POKT endpoint.

###  getAccount()

```js
async function getAccount(
  address: string;
  options?: {
    height?: number;
    rpcUrl?: string;
  }: AccountQueryParams
): Promise<AccountQueryResponse>
```

Gets an account information (address and balance).

##### Parameters

  - `address`: Account address.
  - `height?`: Get the account information at a specific block.
  - `rpcUrl?`: The RPC URL to use. Defaults to a public, sponsored by POKT endpoint.

### getAccountHistory()

```js
async function getAccountHistory(
  address: string;
  options?: {
    height?: number;
    page?: number;
    perPage?: number;
    rpcUrl?: string;
    stakingStatus: number;
  }: AccountQueryParams
): Promise<AppsQueryResponse>
```

Gets a list of transactions from a specific app.

##### Parameters

  - `height?`: Get the account information at a specific block.
  - `page?`: The page requested (for pagination purposes).
  - `perPage?`: Amount of apps to show per page (for pagination purposes).
  - `rpcUrl?`: The RPC URL to use. Defaults to a public, sponsored by POKT endpoint.
  - `stakingStatus?`: If the app fetches are staked, unstaked, or being unstaked.

### getApp()

```js
async function getApp(
  address: string;
  options?: {
    height?: number;
    rpcUrl?: string;
  }: AccountQueryParams
): Promise<AppQueryResponse>
```

Gets an app from the chain.

##### Parameters

  - `address`: Account address.
  - `height?`: Get the account information at a specific block.
  - `rpcUrl?`: The RPC URL to use. Defaults to a public, sponsored by POKT endpoint.

### getApps()

```js
async function getApp(
  options?: {
    height?: number;
    page?: number;
    perPage?: number;
    rpcUrl?: string;
    stakingStatus: number;
  }: AccountQueryParams
): Promise<AppsQueryResponse>
```

Gets a list of apps from the chain, depending on the pagination limits set.

##### Parameters

  - `height?`: Get the account information at a specific block.
  - `page?`: The page requested (for pagination purposes).
  - `perPage?`: Amount of apps to show per page (for pagination purposes).
  - `rpcUrl?`: The RPC URL to use. Defaults to a public, sponsored by POKT endpoint.
  - `stakingStatus?`: If the app fetches are staked, unstaked, or being unstaked.

### getNode()

```js
async function getNode(
  address: string;
  options?: {
    height?: number;
    rpcUrl?: string;
  }: NodeQueryParams
): Promise<NodeQueryResponse>
```
Gets a node from the chain.

##### Parameters

  - `address`: Account address.
  - `height?`: Get the account information at a specific block.
  - `rpcUrl?`: The RPC URL to use. Defaults to a public, sponsored by POKT endpoint.
