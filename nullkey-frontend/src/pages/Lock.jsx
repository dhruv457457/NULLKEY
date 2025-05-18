import { useState } from "react";
import { useStarknet } from "../context/StarknetContext";
import { Contract, uint256, shortString, hash } from "starknet";
import { CONTRACT_ADDRESS, ERC721_ABI } from "../utils/contr";

const secondsPerBlock = 3;

const Lock = () => {
  const { account, contract, readContract, isConnected } = useStarknet();
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
  const [lockIdCreated, setLockIdCreated] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleApprove = async () => {
    try {
      setStatus("🔄 Approving NFT...");
      const nftContract = new Contract(ERC721_ABI, formData.contract, account);
      await nftContract.set_approval_for_all(CONTRACT_ADDRESS, true);
      setStatus("✅ Vault approved.");
    } catch (err) {
      console.error(err);
      setStatus(`❌ Approval failed: ${err.message}`);
    }
  };

  const handleLock = async () => {
    if (!isConnected || !account || !contract || !readContract) {
      setStatus("❌ Wallet not connected or contract not ready.");
      return;
    }

    setStatus("🔄 Submitting lock transaction...");

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

      const commitment = hash.computeHashOnElements([
        shortString.encodeShortString(secret),
        account.address,
      ]);

      const expiryBlocks = BigInt((+expiryMins * 60) / secondsPerBlock);
      const cooldownBlocks = BigInt((+cooldownMins * 60) / secondsPerBlock);
      const deadmanBlocks = BigInt((+deadmanMins * 60) / secondsPerBlock);

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

      // ✅ Correctly call get_lock_count with .method(...)
      const countRes = await readContract.get_lock_count(account.address);
      console.log("get_lock_count response:", countRes);

      const rawCount =
        typeof countRes === "object" ? Object.values(countRes)[0] : countRes;

      const lockCount = parseInt(rawCount.toString(), 10);
      if (isNaN(lockCount)) {
        throw new Error("Unable to fetch lock count");
      }

      setLockIdCreated(lockCount - 1);
      setStatus(`✅ Locked! Your Lock ID is ${lockCount - 1}`);

      window.dispatchEvent(new Event("reloadLocks"));
    } catch (err) {
      console.error(err);
      setStatus(`❌ Lock failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold text-[#00FFFF] mb-4">Lock Your Asset</h2>

      <div className="flex gap-4 mb-4">
        {["NFT", "TOKEN"].map((type) => (
          <button
            key={type}
            onClick={() => setAssetType(type)}
            className={`px-4 py-2 rounded ${
              assetType === type ? "bg-[#00FFFF] text-black" : "bg-gray-800"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        <input
          className="input-style"
          name="contract"
          placeholder="Token Contract"
          value={formData.contract}
          onChange={handleChange}
        />
        {assetType === "NFT" ? (
          <input
            className="input-style"
            name="tokenId"
            placeholder="Token ID"
            value={formData.tokenId}
            onChange={handleChange}
          />
        ) : (
          <input
            className="input-style"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
          />
        )}
        <input
          className="input-style"
          name="secret"
          placeholder="Secret"
          value={formData.secret}
          onChange={handleChange}
        />
        <input
          className="input-style"
          name="expiryMins"
          placeholder="Expiry (mins)"
          value={formData.expiryMins}
          onChange={handleChange}
        />
        <input
          className="input-style"
          name="cooldownMins"
          placeholder="Cooldown (mins)"
          value={formData.cooldownMins}
          onChange={handleChange}
        />
        <input
          className="input-style"
          name="heir"
          placeholder="Heir Address"
          value={formData.heir}
          onChange={handleChange}
        />
        <input
          className="input-style"
          name="deadmanMins"
          placeholder="Deadman Timer (mins)"
          value={formData.deadmanMins}
          onChange={handleChange}
        />
      </div>

      {assetType === "NFT" && (
        <button
          onClick={handleApprove}
          className="mt-4 w-full bg-gray-700 py-2 rounded"
        >
          Approve Vault
        </button>
      )}

      <button
        onClick={handleLock}
        className="mt-2 w-full bg-[#00FFFF] text-black font-semibold py-2 rounded"
      >
        Lock {assetType}
      </button>

      {status && <p className="mt-4 bg-gray-800 p-2 rounded">{status}</p>}
      {lockIdCreated !== null && (
        <p className="mt-2 text-green-400">
          Your Lock ID: <strong>{lockIdCreated}</strong>
        </p>
      )}
    </div>
  );
};

export default Lock;
