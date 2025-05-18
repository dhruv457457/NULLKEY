import { useState } from "react";
import { useStarknet } from "../context/StarknetContext";
import { hash, shortString } from "starknet";

const UnlockF = () => {
  const { contract, account } = useStarknet();
  const [lockId, setLockId] = useState("");
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("");

  const handleUnlock = async () => {
    try {
      setStatus("🔄 Verifying proof...");

      const proof = hash.computeHashOnElements([
        shortString.encodeShortString(secret),
        account.address,
      ]);

      await contract.submit_proof(BigInt(lockId), proof);
      setStatus("✅ Proof submitted successfully.");
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl shadow-xl text-white">
      <input
        className="input-style"
        type="number"
        placeholder="Lock ID"
        value={lockId}
        onChange={(e) => setLockId(e.target.value)}
      />
      <input
        className="input-style"
        type="text"
        placeholder="Secret"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
      <button
        onClick={handleUnlock}
        className="mt-4 bg-[#00FFFF] text-black font-semibold py-2 w-full rounded-lg"
      >
        Submit Proof
      </button>
      {status && (
        <p className="mt-3 text-sm text-center bg-white/10 p-2 rounded-md">
          {status}
        </p>
      )}
    </div>
  );
};

export default UnlockF;
