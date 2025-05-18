// ✅ src/utils/forma.js

/**
 * Safely shortens a Starknet address to 0x1234...abcd
 * @param {string|any} addr - The address to shorten
 * @returns {string}
 */
export const shortAddress = (addr) => {
  try {
    const str = addr?.toString?.();
    if (typeof str === "string" && str.length >= 10) {
      return `${str.slice(0, 6)}...${str.slice(-4)}`;
    }
    return str || "0x0";
  } catch (e) {
    console.warn("Invalid address passed to shortAddress:", addr);
    return "0x0";
  }
};

/**
 * Converts u256 to BigInt string
 * @param {{ low: string | number, high: string | number }} u256 
 * @returns {string}
 */
export const formatU256 = (u256) => {
  if (!u256 || u256.low === undefined || u256.high === undefined) return "0";
  return (
    BigInt(u256.low) + (BigInt(u256.high) << 128n)
  ).toString();
};

/**
 * Safely converts felt/u64/u256 format into a BigInt
 * @param {any} value
 * @returns {bigint}
 */
export const toBigInt = (value) => {
  try {
    if (typeof value === "bigint") return value;
    if (typeof value === "number" || typeof value === "string") return BigInt(value);

    if (typeof value === "object") {
      if (value.low !== undefined && value.high !== undefined) {
        return BigInt(value.low) + (BigInt(value.high) << 128n);
      }
      if (value.low !== undefined) return BigInt(value.low);
    }

    return BigInt(value);
  } catch {
    return 0n;
  }
};
