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
  AppStake = 'AppStake',
  AppUnstake = 'AppUnstake',
  Claim = 'Claim',
  NodeStake = 'NodeStake',
  NodeUnjail = 'NodeUnjail',
  NodeUnstake = 'NodeUnstake',
  Proof = 'Proof',
  Send = 'Send',
  Unknown = 'Unknown'
}

export type AppStakeMessage = {
  chains: string[];
  value: bigint;
};

export type AppUnstakeMessage = {
  address: string;
};

export type SendMessage = {
  to: string;
};

export type NodeStakeMessage = {
  chains: string[];
  serviceUrl: string;
  value: bigint;
};

export type NodeUnstakeMessage = AppUnstakeMessage;

export type NodeUnjailMessage = AppUnstakeMessage;

export type ClaimMessage = {
  chain: string;
  sessionHeight: string;
  appPublicKey: string;
  totalProofs: bigint;
};

export type ProofMessage = {
  appPublicKey: string;
  chain: string;
  requestHash: string
  sessionHeight: string;
};

export type TransactionMessage =
  | AppStakeMessage
  | AppUnstakeMessage
  | ClaimMessage
  | NodeStakeMessage
  | NodeUnstakeMessage
  | ProofMessage
  | SendMessage
  | NodeUnjailMessage;

export type QueryOptions = {
  rpcUrl?: string;
};

export type AccountQueryParams = {
  height: number;
} & QueryOptions;

export type AccountQueryResponse = {
  address: string;
  balance: string;
};

export type AppQueryParams = AccountQueryParams;

export type AppQueryResponse = {
  address: string;
  chains: string[];
  maxRelays: bigint;
  publicKey: string;
  stakedTokens: bigint;
  status: StakingStatus;
  unstakingTime: string;
};

export type AppsQueryParams = AppQueryParams & {
  page: number;
  perPage: number;
  stakingStatus: StakingStatus;
};

export type AppsQueryResponse = AppQueryResponse[];

export type AccountHistoryQueryParams = {
  page: number;
  perPage: number;
  sort: "desc" | "asc";
} & AccountQueryParams;

export type AccountHistoryQueryResponse = {
  fee: bigint;
  hash: string;
  height: string;
  index: string;
  memo: string;
  type: TransactionType;
  message: TransactionMessage;
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

  if (message === "pocketcore/proof") {
    return TransactionType.Proof
  }

  if (message === "pocketcore/claim") {
    return TransactionType.Claim
  }

  if (message === "pos/Send") {
    return TransactionType.Send;
  }

  if (message === "pos/MsgProtoStake") {
    return TransactionType.NodeStake;
  }

  if (message === "pos/MsgStake") {
    return TransactionType.NodeStake;
  }

  if (message === "pos/MsgBeginUnstake") {
    return TransactionType.NodeUnstake;
  }

  if (message === "pos/MsgUnjail") {
    return TransactionType.NodeUnjail;
  }

  // If an user finds this, it should probably be fixed
  return TransactionType.Unknown;
}

function parseTransactionType(
  transaction,
  transactionType: TransactionType
): TransactionMessage | void {

  const messageData = transaction.stdTx.msg.value

  if (transactionType === TransactionType.Send) {
    return {
      to: messageData.to_address,
    } as SendMessage;
  }

  if (
    transactionType === TransactionType.NodeUnjail ||
    transactionType === TransactionType.NodeUnstake
  ) {
    return {
      address: messageData.address,
    } as NodeUnjailMessage;
  }

  if (transactionType === TransactionType.AppUnstake) {
    return {
      address: messageData.application_address,
    };
  }

  if (transactionType === TransactionType.NodeStake) {
    return {
      chains: messageData.chains,
      serviceUrl: messageData.service_url,
      value: BigInt(messageData.value),
    } as NodeStakeMessage;
  }

  if (transactionType === TransactionType.AppStake) {
    return {
      chains: messageData.chains,
      value: messageData.value,
    } as AppStakeMessage;
  }

  if (transactionType === TransactionType.Claim) {
    return {
      chain: messageData.header.chain,
      sessionHeight: messageData.header.session_height,
      appPublicKey: messageData.header.app_public_key,
      totalProofs: messageData.total_proofs
    } as ClaimMessage
  }

  if (transactionType === TransactionType.Proof) {
    return {
      chain: messageData.leaf.value.blockchain,
      sessionHeight: messageData.leaf.value.session_block_height,
      appPublicKey: messageData.leaf.value.aat.app_pub_key,
      requestHash: messageData.leaf.value.request_hash
    } as ProofMessage
  }
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

  return responseOrError.txs.map((tx) => {
    const transactionType = determineTransactionType(tx.stdTx.msg.type);

    return {
      fee: BigInt(tx.stdTx.fee[0].amount),
      hash: tx.hash,
      height: tx.height,
      index: tx.index,
      memo: tx.stdTx.memo,
      type: transactionType,
      message: parseTransactionType(tx, transactionType),
    };
  });
}

