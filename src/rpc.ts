import fetch from "isomorphic-unfetch";
import { InvalidAddressError, RelayAttemptsExhaustedError } from "./errors";
import { isAddress } from "./is-address";

const DEFAULT_RPC_URL =
  "https://mainnet.gateway.pokt.network/v1/6075fbc8aa55b60033dc1421";

const WHITELISTED_RPC_METHODS = new Map([
  ["ACCOUNT", "/v1/query/account"],
  ["ACCOUNT_HISTORY", "/v1/query/accounttxs"],
  ["APP", "/v1/query/app"],
  ["APPS", "/v1/query/apps"],
  ["BLOCK", "/v1/query/block"],
  ["HEIGHT", "/v1/query/height"],
]);

export enum StakingStatus {
  Unstaked = 0,
  Unstaking = 1,
  Staked = 2,
}

export enum TransactionType {
  Send = 0,
  AppStake = 1,
  AppUnstake = 2,
  NodeStake = 3,
  NodeUnstake = 4,
  NodeUnjail = 5,
}

type QueryOptions = {
  rpcUrl?: string;
};

type AccountQueryParams = {
  height: number;
} & QueryOptions;

type AccountQueryResponse = {
  address: string;
  balance: string;
};

type AppQueryParams = AccountQueryParams;

type AppQueryResponse = {
  address: string;
  chains: string[];
  maxRelays: bigint;
  publicKey: string;
  stakedTokens: bigint;
  status: StakingStatus;
  unstakingTime: string;
};

type AppsQueryParams = AppQueryParams & {
  page: number;
  perPage: number;
  stakingStatus: StakingStatus;
};

type AppsQueryResponse = AppQueryResponse[];

type AccountHistoryQueryParams = {
  page: number;
  perPage: number;
  sort: "desc" | "asc";
} & AccountQueryParams;

type AccountHistoryQueryResponse = {
  fee: bigint;
  hash: string;
  height: string;
  index: string;
  memo: string;
  type: TransactionType;
  value: bigint;
};

function composeMethodURL(
  method: string,
  { rpcUrl = "" }: { rpcUrl?: string } = {}
): string {
  if (!WHITELISTED_RPC_METHODS.has(method)) {
    throw new Error(`Method does not exist`);
  }

  const endpoint = rpcUrl !== "" ? rpcUrl : DEFAULT_RPC_URL;

  return `${endpoint}${WHITELISTED_RPC_METHODS.get(method)}`;
}

function determineTransactionType(message: string): TransactionType {
  if (message === "apps/MsgAppStake") {
    return TransactionType.AppStake;
  }

  if (message === "apps/MsgAppBeginUnstake") {
    return TransactionType.AppUnstake;
  }

  if (message === "pos/Send") {
    return TransactionType.Send;
  }

  if (message === "pos/MsgProtoStake") {
    return TransactionType.NodeStake
  }

  if (message === "pos/MsgStake") {
    return TransactionType.NodeStake
  }

  if (message === "pos/MsgBeginUnstake") {
    return TransactionType.NodeUnstake
  }

  if (message === "pos/MsgUnjail") {
    return TransactionType.NodeUnjail
  }

  // If the type's not found, just assume it is a send transaction
  return TransactionType.Send
}

export async function getHeight({
  rpcUrl = "",
}: { rpcUrl?: string } = {}): Promise<number> {
  const res = await fetch(composeMethodURL("HEIGHT", { rpcUrl }), {
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
  { height = 0, rpcUrl = "" }: AccountQueryParams = { height: 0 }
): Promise<AccountQueryResponse> {
  if (!isAddress(address)) {
    throw new InvalidAddressError("Address is not a valid POKT address");
  }
  const res = await fetch(composeMethodURL("ACCOUNT", { rpcUrl }), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

export async function getApp(
  address: string,
  { height = 0, rpcUrl = "" }: AppQueryParams = { height: 0 }
): Promise<AppQueryResponse> {
  if (!isAddress(address)) {
    throw new InvalidAddressError("Address is not a valid POKT address");
  }
  const res = await fetch(composeMethodURL("APP", { rpcUrl }), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, height }),
  });

  const responseOrError = await res.json();

  if ("message" in responseOrError) {
    throw new RelayAttemptsExhaustedError(responseOrError.message);
  }

  return {
    address: responseOrError.address,
    chains: responseOrError.chains,
    maxRelays: BigInt(responseOrError.max_relays),
    publicKey: responseOrError.public_key,
    stakedTokens: BigInt(responseOrError.staked_tokens),
    status: responseOrError.status,
    unstakingTime: responseOrError.unstaking_time,
  };
}

export async function getApps(
  {
    height = 0,
    page = 1,
    perPage = 100,
    rpcUrl = "",
    stakingStatus = 2,
  }: AppsQueryParams = { height: 0, page: 1, perPage: 100, stakingStatus: 2 }
): Promise<AppsQueryResponse> {
  const res = await fetch(composeMethodURL("APPS", { rpcUrl }), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      height,
      opts: { page, per_page: perPage, staking_status: stakingStatus },
    }),
  });

  const responseOrError = await res.json();

  if ("message" in responseOrError) {
    throw new RelayAttemptsExhaustedError(responseOrError.message);
  }

  return responseOrError.result.map((app) => ({
    address: app.address,
    chains: app.chains,
    maxRelays: BigInt(app.max_relays),
    publicKey: app.public_key,
    stakedTokens: BigInt(app.staked_tokens),
    status: app.status,
    unstakingTime: app.unstaking_time,
  }));
}

export async function getAccountHistory(
  address: string,
  {
    height = 0,
    page = 1,
    perPage = 100,
    rpcUrl = "",
    sort = "desc",
  }: AccountHistoryQueryParams = {
    height: 0,
    page: 1,
    perPage: 100,
    rpcUrl: "",
    sort: "desc",
  }
): Promise<AccountHistoryQueryResponse> {
  if (!isAddress(address)) {
    throw new InvalidAddressError("Address is not a valid POKT address");
  }
  const res = await fetch(composeMethodURL("ACCOUNT_HISTORY", { rpcUrl }), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      height,
      opts: { page, per_page: perPage, sort },
    }),
  });

  const responseOrError = await res.json();

  if ("message" in responseOrError) {
    throw new RelayAttemptsExhaustedError(responseOrError.message);
  }

  return responseOrError.txs.map((tx) => ({
    fee: BigInt(tx.stdTx.fee[0].amount),
    hash: tx.hash,
    height: tx.height,
    index: tx.index,
    memo: tx.stdTx.memo,
    type: determineTransactionType(tx.stdTx.msg.type),
    // TODO: parse value and add extra tx metadata depending on type
    value: tx.stdTx.msg.value.value
  }));
}
