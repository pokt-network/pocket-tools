/**
 * Converts a normal integer POKT amount to a 6-decimal representation (uPOKT).
 * 1 POKT = 1000000 uPOKT.
 * @param quantity the amount to convert.
 * @returns the amount as a native Javascript Big Integer.
 */
export function poktToUpokt(quantity: string | bigint | number): bigint {
  return BigInt(quantity) * BigInt(1000000);
}
