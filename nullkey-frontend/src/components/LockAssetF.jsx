import { useState } from "react";
import { useStarknet } from "../context/StarknetContext";
import { uint256, num, hash } from "starknet";

const secondsPerBlock = 3;

const LockAssetF= () => {
  const { account, contract, isConnected } = useStarknet();
  const [assetType, setAssetType] = useState("NFT");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    contract: "",
    tokenId: "",
    amount: "",
    secret: "",
    expiryMins: "",
    cooldownMins: "",
    heir: "",
    deadmanMins: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!isConnected || !account || !contract) {
      setStatus("❌ Wallet not connected");
      return;
    }

    setStatus("🔄 Locking...");
    try {
      const commitment = hash.pedersen(
        num.toFelt(form.secret),
        num.toFelt(account.address)
      );

      const common = [
        form.contract,
        commitment,
        BigInt((+form.expiryMins * 60) / secondsPerBlock),
        BigInt((+form.cooldownMins * 60) / secondsPerBlock),
        form.heir,
        BigInt((+form.deadmanMins * 60) / secondsPerBlock),
      ];

      if (assetType === "NFT") {
        await contract.lock_nft(
          form.contract,
          uint256.bnToUint256(BigInt(form.tokenId)),
          ...common.slice(1)
        );
      } else {
        await contract.lock_token(
          form.contract,
          uint256.bnToUint256(BigInt(form.amount)),
          ...common.slice(1)
        );
      }

      setStatus("✅ Asset locked!");
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl shadow-xl text-white">
      <div className="mb-4 flex gap-3">
        {["NFT", "TOKEN"].map((type) => (
          <button
            key={type}
            onClick={() => setAssetType(type)}
            className={`px-4 py-2 rounded-lg ${
              assetType === type ? "bg-[#00FFFF] text-black" : "border border-white/20 bg-white/10"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid gap-3 text-sm">
        <input className="input-style" name="contract" placeholder="Contract Address" value={form.contract} onChange={handleChange} />
        {assetType === "NFT" ? (
          <input className="input-style" name="tokenId" placeholder="Token ID" type="number" value={form.tokenId} onChange={handleChange} />
        ) : (
          <input className="input-style" name="amount" placeholder="Amount" type="number" value={form.amount} onChange={handleChange} />
        )}
        <textarea className="input-style" name="secret" rows={2} placeholder="Secret for ZK Proof" value={form.secret} onChange={handleChange} />
        <input className="input-style" name="expiryMins" type="number" placeholder="Expiry (minutes)" value={form.expiryMins} onChange={handleChange} />
        <input className="input-style" name="cooldownMins" type="number" placeholder="Cooldown (minutes)" value={form.cooldownMins} onChange={handleChange} />
        <input className="input-style" name="heir" placeholder="Heir Address" value={form.heir} onChange={handleChange} />
        <input className="input-style" name="deadmanMins" type="number" placeholder="Deadman (minutes)" value={form.deadmanMins} onChange={handleChange} />
      </div>

      <button onClick={handleSubmit} className="mt-5 w-full bg-[#00FFFF] text-black font-bold py-3 rounded-lg hover:scale-105 transition">
        Lock {assetType}
      </button>

      {status && <p className="mt-4 text-sm text-center bg-white/10 p-2 rounded-md">{status}</p>}
    </div>
  );
};

export default LockAssetF;
