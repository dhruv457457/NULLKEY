// src/utils/format.js
export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "0x0";

export const formatU256 = (u256) => {
  if (!u256 || !u256.low) return "0";
  return BigInt(u256.low) + (BigInt(u256.high) << 128n);
};
