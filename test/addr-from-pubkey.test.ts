import { getAddressFromPublicKey } from "../src/addr-from-pubkey";

const KNOWN_ACCOUNTS = new Map([
  // Ethers.js #1
  [
    "ETHERS",
    {
      address: "fa08efadee9eaa9d5549bccd6087002a5f47c0e2",
      publicKey:
        "2cf38013f8cbe524db3172ec507967ec551fd14cea8209cf4c9da2a490cecf74",
    },
  ],
  [
    "EARNIFI",
    {
      address: "3808c2de7d2e8eeaa2e13768feb78b10b13c8699",
      publicKey:
        "a3edc0d94701ce5e0692754b519ab125c921c704f11439638834894a5ec5fa53",
    },
  ],
  [
    "DARK_FOREST",
    {
      address: "30bce3a27537c42d60ac70c7e1da5d5d7e56b571",
      publicKey:
        "e3f6275e78a5bc93e98a927a662693ad723906df8897900f2ed6ed91642f8b08",
    },
  ],
]);

describe("addr-from-pubkey", () => {
  it("correctly converts KNOWN public keys to their addresses", async () => {
    for (const [_, account] of KNOWN_ACCOUNTS) {
      expect(await getAddressFromPublicKey(account.publicKey)).toEqual(
        account.address
      );
    }
  });
});
