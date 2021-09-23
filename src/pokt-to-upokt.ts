export function poktToUpokt(quantity: string | bigint | number): bigint {
  return BigInt(quantity) * BigInt(1000000);
}
