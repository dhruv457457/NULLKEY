import { useState } from "react";
import { useStarknet } from "../context/StarknetContext";

const HeirClai= () => {
  const { contract } = useStarknet();
  const [user, setUser] = useState("");
  const [lockId, setLockId] = useState("");
  const [status, setStatus] = useState("");

  const handleWithdraw = async () => {
    try {
      setStatus("🔄 Requesting...");
      await contract.heir_withdraw(user, lockId);
      setStatus("✅ Heir withdrawal successful.");
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl shadow-xl text-white">
      <input className="input-style" placeholder="User Address" value={user} onChange={(e) => setUser(e.target.value)} />
      <input className="input-style" placeholder="Lock ID" value={lockId} onChange={(e) => setLockId(e.target.value)} />
      <button onClick={handleWithdraw} className="mt-4 bg-[#00FFFF] text-black font-semibold py-2 w-full rounded-lg">
        Heir Withdraw
      </button>
      {status && <p className="mt-3 text-sm text-center bg-white/10 p-2 rounded-md">{status}</p>}
    </div>
  );
};

export default HeirClai;
