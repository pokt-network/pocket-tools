import fetch from "isomorphic-unfetch";
import { InvalidAddressError, RelayAttemptsExhaustedError } from "./errors";
import { isAddress } from "./is-address";

const DEFAULT_RPC_URL =
  "https://mainnet.gateway.pokt.network/v1/6075fbc8aa55b60033dc1421/v1/";

const WHITELISTED_RPC_METHODS = new Map([
  ["ACCOUNT", "query/account"],
  ["BLOCK", "query/block"],
  ["HEIGHT", "query/height"],
]);

type Coin = {
  amount: string | bigint;
  denom: "upokt" | "pokt";
};

type AppQueryParams = {
  height: number;
};

type AppQueryResponse = {
  address: string;
  balance: string;
};

function composeMethodURL(method: string) {
  if (!WHITELISTED_RPC_METHODS.has(method)) {
    throw new Error(`Method does not exist`);
  }
  return `${DEFAULT_RPC_URL}${WHITELISTED_RPC_METHODS.get(method)}`;
}

export async function getHeight(): Promise<number> {
  const res = await fetch(composeMethodURL("HEIGHT"), {
    method: "POST",
  });

  const responseOrError = await res.json();

  if ("message" in responseOrError) {
    throw new RelayAttemptsExhaustedError(responseOrError.message);
  }

  return responseOrError.height;
}

export async function getAccount(
  address: string,
  { height = 0 }: AppQueryParams
): Promise<AppQueryResponse> {
  if (!isAddress(address)) {
    throw new InvalidAddressError("Address is not a valid POKT address");
  }
  const res = await fetch(composeMethodURL("ACCOUNT"), {
    method: "POST",
    body: JSON.stringify({ address, height }),
  });

  const responseOrError = await res.json();

  if ("message" in responseOrError) {
    throw new RelayAttemptsExhaustedError(responseOrError.message);
  }

  return {
    address: responseOrError.address,
    balance: responseOrError.coins
      .reduce((acc: bigint, { amount }) => acc + BigInt(amount), BigInt(0))
      .toString(),
  };
}
