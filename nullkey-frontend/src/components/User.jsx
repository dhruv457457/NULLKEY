// src/components/User.jsx
import React, { useEffect, useState } from "react";
import { useStarknet } from "../context/StarknetContext";
import LockCard from "./LockC";

const LOCK_FIELDS = 14;

const parseLockInfoArray = (flat) => {
  const locks = [];

  for (let i = 0; i < flat.length; i += LOCK_FIELDS) {
    locks.push({
      assetType: flat[i] === "0" ? "NFT" : "Token",
      tokenContract: flat[i + 1],
      tokenId: {
        low: flat[i + 2],
        high: flat[i + 3],
      },
      amount: {
        low: flat[i + 4],
        high: flat[i + 5],
      },
      commitment: flat[i + 6],
      unlocked: flat[i + 7] === "1" || flat[i + 7] === "True",
      failedAttempts: Number(flat[i + 8]),
      lastAttemptBlock: Number(flat[i + 9]),
      cooldownBlocks: Number(flat[i + 10]),
      lockBlock: Number(flat[i + 11]),
      expiryBlocks: Number(flat[i + 12]),
      heir: flat[i + 13],
      deadmanBlocks: Number(flat[i + 14]),
    });
  }

  return locks;
};

const User = () => {
  const { account, contract, isConnected } = useStarknet();
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const fetchLocks = async () => {
    if (!isConnected || !contract || !account) return;

    setLoading(true);
    setStatus("");

    try {
      const countRes = await contract.get_lock_count.call(account.address);
      const total = Number(countRes.result[0]);

      if (total === 0) {
        setLocks([]);
        return;
      }

   const result = await contract.get_user_locks_paginated.call({
  user: account.address,
  start: 0,
  limit: total
});

      const parsed = parseLockInfoArray(result.result);
      setLocks(parsed);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to load locks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocks();

    const reload = () => fetchLocks();
    window.addEventListener("reloadLocks", reload);
    return () => window.removeEventListener("reloadLocks", reload);
  }, [isConnected]);

  return (
    <div className="space-y-4">
      {loading && <p className="text-white text-sm">Loading locks...</p>}
      {status && <p className="text-red-400 text-sm">{status}</p>}
      {!loading && locks.length === 0 && (
        <p className="text-white/70 text-sm">No active locks found.</p>
      )}
      {locks.map((lock, idx) => (
        <LockCard key={idx} lock={lock} lockId={idx} />
      ))}
    </div>
  );
};

export default User;
