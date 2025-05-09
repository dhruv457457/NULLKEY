import { useState } from "react";

const LockInfo = () => {
  const [lockInfo, setLockInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLockInfo = async () => {
    setLoading(true);
    try {
      // 👉 Replace with Starknet.js call later
      const dummy = {
        nft: "0x03a34a...29b10",
        tokenId: 1,
        unlocked: true,
        failedAttempts: 0,
        lockedAt: 757371,
      };
      setTimeout(() => {
        setLockInfo(dummy);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-white">🔒 Locker Status</h2>

      <button
        onClick={fetchLockInfo}
        disabled={loading}
        className="mb-6 px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-md transition text-white font-medium"
      >
        {loading ? "Fetching..." : "Check Locker Info"}
      </button>

      {lockInfo && (
        <div className="text-sm space-y-2 text-white">
          <p><strong>NFT Contract:</strong> {lockInfo.nft}</p>
          <p><strong>Token ID:</strong> {lockInfo.tokenId}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`font-semibold ${lockInfo.unlocked ? "text-green-400" : "text-yellow-400"}`}>
              {lockInfo.unlocked ? "Unlocked" : "Locked"}
            </span>
          </p>
          <p><strong>Failed Attempts:</strong> {lockInfo.failedAttempts}</p>
          <p><strong>Locked At Block:</strong> {lockInfo.lockedAt}</p>
        </div>
      )}
    </div>
  );
};

export default LockInfo;
