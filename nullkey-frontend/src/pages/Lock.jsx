import { useState } from "react";
import { useStarknet } from "../context/StarknetContext";
import { uint256, num, hash } from "starknet";

const secondsPerBlock = 3; // Approximate block time on Starknet

const Lock = () => {
  const { account, contract, isConnected } = useStarknet();
  const [assetType, setAssetType] = useState("NFT");

  const [formData, setFormData] = useState({
    contract: "",
    tokenId: "",
    amount: "",
    secret: "",
    expiryMins: "",
    cooldownMins: "",
    heir: "",
    deadmanMins: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLock = async () => {
    if (!isConnected || !account || !contract) {
      setStatus("❌ Wallet not connected.");
      return;
    }

    setStatus("🔄 Submitting...");

    try {
      const {
        contract: tokenContract,
        tokenId,
        amount,
        secret,
        expiryMins,
        cooldownMins,
        heir,
        deadmanMins,
      } = formData;

      const commitment = hash.pedersen(
        num.toFelt(secret),
        num.toFelt(account.address)
      );

      const expiryBlocks = BigInt(Math.floor((+expiryMins * 60) / secondsPerBlock));
      const cooldownBlocks = BigInt(Math.floor((+cooldownMins * 60) / secondsPerBlock));
      const deadmanBlocks = BigInt(Math.floor((+deadmanMins * 60) / secondsPerBlock));

      if (assetType === "NFT") {
        await contract.lock_nft(
          tokenContract,
          uint256.bnToUint256(BigInt(tokenId)),
          commitment,
          expiryBlocks,
          cooldownBlocks,
          heir,
          deadmanBlocks
        );
      } else {
        await contract.lock_token(
          tokenContract,
          uint256.bnToUint256(BigInt(amount)),
          commitment,
          expiryBlocks,
          cooldownBlocks,
          heir,
          deadmanBlocks
        );
      }

      setStatus("✅ Asset locked successfully.");
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold mb-6 text-[#00FFFF]">Securely Lock Your Asset</h2>

      {/* Asset Type Toggle */}
      <div className="flex gap-4 mb-6">
        {["NFT", "TOKEN"].map((type) => (
          <button
            key={type}
            onClick={() => setAssetType(type)}
            className={`px-4 py-2 rounded-lg ${
              assetType === type
                ? "bg-[#00FFFF] text-black"
                : "bg-white/10 text-white border border-white/20"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="grid gap-4 text-sm text-white">
        <input
          name="contract"
          placeholder="Token Contract Address"
          value={formData.contract}
          onChange={handleChange}
          className="input-style"
        />

        {assetType === "NFT" ? (
          <input
            name="tokenId"
            placeholder="Token ID"
            type="number"
            value={formData.tokenId}
            onChange={handleChange}
            className="input-style"
          />
        ) : (
          <input
            name="amount"
            placeholder="Token Amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            className="input-style"
          />
        )}

        <textarea
          name="secret"
          placeholder="Secret (used for proof later)"
          value={formData.secret}
          onChange={handleChange}
          className="input-style"
          rows={3}
        />

        <input
          name="expiryMins"
          type="number"
          placeholder="Expiry (in minutes)"
          value={formData.expiryMins}
          onChange={handleChange}
          className="input-style"
        />

        <input
          name="cooldownMins"
          type="number"
          placeholder="Cooldown Period (in minutes)"
          value={formData.cooldownMins}
          onChange={handleChange}
          className="input-style"
        />

        <input
          name="heir"
          placeholder="Heir Wallet Address"
          value={formData.heir}
          onChange={handleChange}
          className="input-style"
        />

        <input
          name="deadmanMins"
          type="number"
          placeholder="Deadman Timer (in minutes)"
          value={formData.deadmanMins}
          onChange={handleChange}
          className="input-style"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleLock}
        className="mt-6 w-full bg-[#00FFFF] text-black font-semibold py-3 rounded-xl hover:scale-105 transition-all"
      >
        Lock {assetType}
      </button>

      {status && (
        <p className="mt-4 text-sm text-center text-white bg-white/10 px-4 py-2 rounded-lg">
          {status}
        </p>
      )}
    </div>
  );
};

export default Lock;
