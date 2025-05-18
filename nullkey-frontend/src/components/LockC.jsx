// src/components/LockCard.jsx
import React from "react";
import { shortAddress, formatU256, toBigInt } from "../utils/forma";

const LockC = ({ lock, lockId }) => {
  const isNFT = lock.assetType === "NFT";

  const blockToMinutes = (blocks) => {
    try {
      const b = toBigInt(blocks);
      const seconds = b * 3n;
      return Number(seconds / 60n);
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="border border-white/10 bg-white/5 rounded-xl p-4 text-white text-sm space-y-2 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">
          {isNFT ? "🖼️ NFT Lock" : "💰 Token Lock"} #{lockId}
        </h4>
        {lock.unlocked && (
          <span className="text-green-400 font-semibold">Unlocked ✅</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <span className="text-gray-400">Token Contract:</span>
          <div className="break-all">{shortAddress(lock.tokenContract)}</div>
        </div>

        {isNFT ? (
          <div>
            <span className="text-gray-400">Token ID:</span>
            <div>{formatU256(lock.tokenId)}</div>
          </div>
        ) : (
          <div>
            <span className="text-gray-400">Amount:</span>
            <div>{formatU256(lock.amount)}</div>
          </div>
        )}

        <div>
          <span className="text-gray-400">Heir:</span>
          <div className="break-all">{shortAddress(lock.heir)}</div>
        </div>

        <div>
          <span className="text-gray-400">Cooldown:</span>
          <div>{blockToMinutes(lock.cooldownBlocks)} mins</div>
        </div>

        <div>
          <span className="text-gray-400">Expiry:</span>
          <div>{blockToMinutes(lock.expiryBlocks)} mins</div>
        </div>

        <div>
          <span className="text-gray-400">Deadman:</span>
          <div>{blockToMinutes(lock.deadmanBlocks)} mins</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-white/10">
        <div className="text-xs text-white/70">
          Attempts: {+lock.failedAttempts}
        </div>
        <div className="text-xs text-white/70">
          Lock Block: {+lock.lockBlock}
        </div>
      </div>
    </div>
  );
};

export default LockC;
