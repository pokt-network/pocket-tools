import { isAddress } from "../src/is-address";
import { KNOWN_ACCOUNTS } from "./test-utils";

describe("is-address", () => {
  it("detect valids addresses", () => {
    for (const [_, account] of KNOWN_ACCOUNTS) {
      expect(isAddress(account.address)).toStrictEqual(true);
    }
  });
  it("detects wrong addresses as they're longer than what they should be", () => {
    for (const [_, account] of KNOWN_ACCOUNTS) {
      // Using public key instead of address
      // A bit more common than what it seems, mainly due to the fact
      // that some pocketJS methods use an address and others a public key
      expect(isAddress(account.publicKey)).toStrictEqual(false);
    }
  });
  it("detects wrong addresses as they contain extraneous characters", () => {
    // non-alphanumeric character at the end of the string
    expect(isAddress("fa08efadee9eaa9d5549bccd6087002a5f47c0e}")).toStrictEqual(
      false
    );
    // non-alphanumeric character in the middle of the string
    expect(isAddress("fa08e!adee9eaa9d5549bccd6087002a5f47c0e2")).toStrictEqual(
      false
    );
    // whitespace
    expect(isAddress("fa08e!adee9eaa9d5549bccd6087002a5f47c0e ")).toStrictEqual(
      false
    );
  });
});
