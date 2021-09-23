import { poktToUpokt } from "../src/pokt-to-upokt";

describe("pokt-to-upokt", () => {
  it("converts string numbers", () => {
    expect(poktToUpokt("100").toString()).toStrictEqual("100000000");
    expect(poktToUpokt("100").toString()).toStrictEqual("100000000");
    expect(poktToUpokt("10000").toString()).toStrictEqual("10000000000");
    expect(poktToUpokt("8000").toString()).toStrictEqual("8000000000");
  });
  it("convert (integer) numbers", () => {
    expect(poktToUpokt(100).toString()).toStrictEqual("100000000");
    expect(poktToUpokt(100).toString()).toStrictEqual("100000000");
    expect(poktToUpokt(10000).toString()).toStrictEqual("10000000000");
    expect(poktToUpokt(8000).toString()).toStrictEqual("8000000000");
  });
  /**
   * For additional context: BigInts only support integers,
   * as per their name. Lots of people expect decimal support due to old libraries
   * using (not very good) BigDecimal libraries, but as the protocol itself doesn't support
   * BigDecimals, we've also chosen to not support it ourselves.
   */
  it("throws when trying to convert floats", () => {
    expect(() => poktToUpokt(4.2)).toThrow(/cannot/);
    expect(() => poktToUpokt(13.37)).toThrow(/cannot/);
  });
});
