// src/components/UserLocks.jsx
import React, { useEffect, useState } from "react";
import { useStarknet } from "../context/StarknetContext";
import LockCard from "./LockC"; // ✅ no curly braces for default export

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
      const result = await contract.get_user_locks_paginated(account.address, 0, 10);
      setLocks(result); // assuming result is an array of LockInfo structs
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to load locks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocks();
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
