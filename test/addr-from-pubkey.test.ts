import { getAddressFromPublicKey } from "../src/addr-from-pubkey";
import { KNOWN_ACCOUNTS } from './test-utils'

describe("addr-from-pubkey", () => {
  it("correctly converts KNOWN public keys to their addresses", async () => {
    for (const [_, account] of KNOWN_ACCOUNTS) {
      expect(await getAddressFromPublicKey(account.publicKey)).toEqual(
        account.address
      );
    }
  });
});
