import { useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  getAccount,
  getAccountHistory,
  getAddressFromPublicKey,
  getApp,
  getNode,
  isAddress,
  poktToUpokt,
  AppStakeMessage,
  AppQueryResponse,
  ClaimMessage,
  NodeStakeMessage,
  NodeQueryResponse,
  ProofMessage,
  SendMessage,
  TransactionMessage,
  TransactionType,
} from "../..";
import { styled, css } from "./stitches-config";
import { globalStyles } from "./global-styles";

function noop() {}

const Spacer = styled("span", {
  display: "block",
  width: 16,
  height: 16,
  minWidth: 16,
  minHeight: 16,
});

function App() {
  const [activeSection, setActiveSection] = useState<"history" | "utils">(
    "history"
  );
  const { cache } = useSWRConfig();

  globalStyles();

  return (
    <div className={css({ padding: "calc(2 * $space$1)" })()}>
      <About />
      <div
        className={css({
          width: "calc(75 * $space$1)",
          margin: "0 auto",
        })()}
      >
        <div
          className={css({
            width: "100%",
            display: "flex",
          })()}
        >
          <button
            className={css({
              width: "100%",
              background: activeSection === "history" ? "#888" : "transparent",
              color: activeSection === "history" ? "#000" : "#ccc",
            })()}
            onClick={() => {
              setActiveSection("history");
              // @ts-ignore
              cache.clear();
            }}
          >
            account history
          </button>
          <button
            className={css({
              width: "100%",
              background: activeSection === "utils" ? "#888" : "transparent",
              color: activeSection === "utils" ? "#000" : "#ccc",
            })()}
            onClick={() => {
              setActiveSection("utils");
              // @ts-ignore
              cache.clear();
            }}
          >
            utils
          </button>
        </div>
        {activeSection === "history" && <HistorySection />}
        {activeSection === "utils" && <UtilsSection />}
      </div>
    </div>
  );
}

function HistorySection() {
  const [addr, setAddr] = useState("");
  const isValidAddr = useMemo(() => {
    return isAddress(addr);
  }, [addr]);
  const { data, error } = useSWR(`info/${addr}1`, async function () {
    if (!isValidAddr) {
      return;
    }

    const { balance } = await getAccount(addr);
    const txs = await getAccountHistory(addr);

    const accountType: "node" | "app" | "account" = txs.reduce(
      (prev: "node" | "app" | "account", tx) => {
        const txType = tx.type;

        if (
          (txType === TransactionType.AppStake ||
            txType === TransactionType.AppUnstake) &&
          prev === "account"
        ) {
          return "app";
        }

        if (
          (txType === TransactionType.NodeStake ||
            txType === TransactionType.NodeUnjail ||
            txType === TransactionType.NodeUnstake ||
            txType === TransactionType.Claim ||
            txType === TransactionType.Proof) &&
          prev === "account"
        ) {
          return "node";
        }

        return prev;
      },
      "account"
    );

    const accountData =
      accountType === "account"
        ? noop()
        : accountType === "app"
        ? await getApp(addr)
        : await getNode(addr);

    const typedAccountData =
      accountType === "account"
        ? undefined
        : accountType === "app"
        ? (accountData as AppQueryResponse)
        : (accountData as NodeQueryResponse);

    return { accountType, typedAccountData, balance, txs: txs.reverse() };
  });

  useEffect(() => console.log("swr", data, error), [data, error]);

  return (
    <>
      <Header addr={addr} isValidAddr={isValidAddr} setAddr={setAddr} />
      <Spacer />
      {addr === "" || !isValidAddr ? (
        ""
      ) : data === undefined ? (
        "Loading..."
      ) : (
        <>
          <div
            className={css({
              padding: "calc(2 * $space$1)",
              border: `2px solid ${
                data.accountType === "app"
                  ? "$gold"
                  : data.accountType === "node"
                  ? "$pink"
                  : "#ccc"
              }`,
              display: "flex",
              flexDirection: "column",
            })()}
          >
            <h3
              className={css({ margin: 0, fontSize: "calc(2 * $space$1)" })()}
            >
              {data.accountType === "app"
                ? "Application Account"
                : data.accountType === "node"
                ? "Node Account"
                : "Normal Account"}
            </h3>
            <ul
              className={css({
                listStyleType: "none",
                paddingLeft: "0",
              })()}
            >
              <li>Address: {addr}</li>
              <li>Balance: {data?.balance}</li>
              {data.accountType === "app" && (
                <>
                  <li>chains: {data?.typedAccountData?.chains?.toString()}</li>
                  <li>
                    maxRelays:{" "}
                    {(data?.typedAccountData as AppQueryResponse)?.maxRelays?.toString()}
                  </li>
                  <li>
                    stakedTokens:{" "}
                    {data?.typedAccountData?.stakedTokens?.toString()}
                  </li>
                  <li>status: {data?.typedAccountData?.status?.toString()}</li>
                  <li>
                    unstakingTime:{" "}
                    {data?.typedAccountData?.unstakingTime?.toString()}
                  </li>
                </>
              )}
              {data.accountType === "node" && (
                <>
                  <li>chains: {data?.typedAccountData?.chains?.toString()}</li>
                  <li>
                    jailed:{" "}
                    {(data?.typedAccountData as NodeQueryResponse)?.jailed?.toString()}
                  </li>
                  <li>
                    publicKey: {data?.typedAccountData?.publicKey?.toString()}
                  </li>
                  <li>
                    serviceUrl:{" "}
                    {(data?.typedAccountData as NodeQueryResponse)?.serviceUrl?.toString()}
                  </li>
                  <li>
                    stakedTokens:{" "}
                    {data?.typedAccountData?.stakedTokens?.toString()}
                  </li>
                  <li>status: {data?.typedAccountData?.status?.toString()}</li>
                  <li>
                    unstakingTime:{" "}
                    {data?.typedAccountData?.unstakingTime?.toString()}
                  </li>
                </>
              )}
            </ul>
          </div>
          <Spacer />
          <h3 className={css({ fontSize: "calc(2 * $space$1)" })()}>
            Account History
          </h3>
          {data.txs.map(({ fee, hash, height, memo, message, type }, i) => {
            return (
              <div
                key={i}
                className={css({
                  padding: "calc(2 * $space$1)",
                  border: "2px solid #ccc",
                  display: "flex",
                  flexDirection: "column",
                })()}
              >
                <ul
                  className={css({
                    listStyleType: "none",
                    paddingLeft: "0",
                    li: {
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    },
                  })()}
                >
                  <li>Hash: {hash}</li>
                  <li>Height: {height.toString()} uPOKT</li>
                  <li>Fee: {fee.toString()} uPOKT</li>
                  {memo && <li>Memo: {memo.toString()}</li>}
                  <li>Type: {type}</li>
                  <li>
                    Message: <Message type={type} message={message} />
                  </li>
                </ul>
              </div>
            );
          }) ?? []}
        </>
      )}
    </>
  );
}

function UtilsSection() {
  const [pubKey, setPubKey] = useState("");
  const [addr, setAddr] = useState("");
  const [pokt, setPokt] = useState("");
  const [upokt, setUpokt] = useState("");

  return (
    <>
      <header
        className={css({
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: "calc(2 * $space$1)",
          borderBottom: "4px solid #ccc",
        })()}
      >
        <h2 className={css({ fontSize: "calc(2.5 * $space$1)" })()}>Utils</h2>
      </header>
      <div>
        <h3>POKT to uPOKT</h3>
        <input
          type="number"
          value={pokt}
          onChange={(e) => {
            const value = e.currentTarget.value.trim();
            const upokt = poktToUpokt(value);
            setPokt(value);
            setUpokt(upokt.toString());
          }}
          className={css({
            background: "transparent",
            height: "calc(4 * $space$1)",
            width: "100%",
            color: "#ccc",
            border: `2px solid #ccc`,
          })()}
        ></input>
        <span
          className={css({
            alignSelf: "flex-start",
            color: `#ccc`,
          })()}
        >
          uPOKT: {upokt.toString()}
        </span>
      </div>
      <div>
        <h3>Address from Public Key</h3>
        <input
          type="text"
          value={pubKey}
          onChange={async (e) => {
            const value = e.currentTarget.value.trim();
            const addr = await getAddressFromPublicKey(value);
            setAddr(addr);
            setPubKey(value.toString());
          }}
          className={css({
            background: "transparent",
            height: "calc(4 * $space$1)",
            width: "100%",
            color: "#ccc",
            border: `2px solid #ccc`,
          })()}
        ></input>
        <span
          className={css({
            alignSelf: "flex-start",
            color: `#ccc`,
          })()}
        >
          Address: {addr}
        </span>
      </div>
    </>
  );
}

function Message({
  type,
  message,
}: {
  type: TransactionType;
  message: TransactionMessage;
}) {
  if (type === TransactionType.NodeStake) {
    const typedMessage = message as NodeStakeMessage;

    return (
      <ul>
        <li>chains: {typedMessage.chains.toString()}</li>
        <li>stake: {typedMessage.value.toString()}</li>
        <li>serviceURL: {typedMessage.serviceUrl.toString()}</li>
      </ul>
    );
  }

  if (type === TransactionType.Send) {
    const typedMessage = message as SendMessage;

    return (
      <ul>
        <li>to: {typedMessage.to}</li>
      </ul>
    );
  }

  if (type === TransactionType.Claim) {
    const typedMessage = message as ClaimMessage;

    return (
      <ul>
        <li>chain: {typedMessage.chain.toString()}</li>
        <li>sessionHeight: {typedMessage.sessionHeight.toString()}</li>
        <li>appPublicKey: {typedMessage.appPublicKey}</li>
        <li>totalProofs: {typedMessage.totalProofs.toString()}</li>
      </ul>
    );
  }

  if (type === TransactionType.Proof) {
    const typedMessage = message as ProofMessage;

    return (
      <ul>
        <li>chain: {typedMessage.chain.toString()}</li>
        <li>sessionHeight: {typedMessage.sessionHeight.toString()}</li>
        <li>appPublicKey: {typedMessage.appPublicKey}</li>
        <li>requestHash: {typedMessage.requestHash}</li>
      </ul>
    );
  }

  if (type === TransactionType.AppStake) {
    const typedMessage = message as AppStakeMessage;

    return (
      <ul>
        <li>chains: {typedMessage.chains.toString()}</li>
        <li>stake: {typedMessage.value.toString()}</li>
      </ul>
    );
  }

  // Other types have no useful info
  return null;
}

function About() {
  return (
    <div
      className={css({
        alignItems: "center",
        display: "flex",
        height: "calc(8 * $space$1)",
        justifyContent: "space-between",
        width: "100%",
      })()}
    >
      <h1>pocket-tools</h1>
      <a
        className="button"
        href="https://github.com/pokt-foundation/pocket-tools"
        rel="noopener noreferer"
        target="_blank"
      >
        github
      </a>
    </div>
  );
}

function Header({
  addr,
  isValidAddr,
  setAddr,
}: {
  addr: string;
  isValidAddr: boolean;
  setAddr: Function;
}) {
  return (
    <header
      className={css({
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: "calc(2 * $space$1)",
        borderBottom: "4px solid #ccc",
      })()}
    >
      <h2 className={css({ fontSize: "calc(2.5 * $space$1)" })()}>
        Account Info
      </h2>
      <input
        type="text"
        value={addr}
        onChange={(e) => {
          const value = e.currentTarget.value.trim();
          setAddr(value);
        }}
        className={css({
          background: "transparent",
          height: "calc(4 * $space$1)",
          width: "100%",
          color: "#ccc",
          border: `2px solid ${
            addr === "" ? "#888" : isValidAddr ? "$green" : "red"
          }`,
        })()}
      ></input>
      <span
        className={css({
          alignSelf: "flex-start",
          color: `${addr === "" ? "#888" : isValidAddr ? "$green" : "red"}`,
        })()}
      >
        {addr === "" ? "" : isValidAddr ? "Valid address" : "Invalid address"}
      </span>
    </header>
  );
}

export default App;
