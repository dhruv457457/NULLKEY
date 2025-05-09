import { useState } from "react";
import { useStarknet } from "../context/StarknetContext";

const Withdraw = () => {
  const { contract, isConnected } = useStarknet();
  const [txHash, setTxHash] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!isConnected || !contract) {
      setStatus({ type: "error", message: "Connect your wallet first." });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      const tx = await contract.withdraw();
      setTxHash(tx.transaction_hash);
      setStatus({ type: "success", message: "Withdraw successful!" });
    } catch (err) {
      console.error("Withdraw failed:", err);
      setStatus({
        type: "error",
        message: err.message || "Withdraw failed. Make sure the asset is unlocked.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-white p-4 bg-white/5 rounded-lg backdrop-blur-md border border-white/10">
      <h2 className="text-2xl font-semibold mb-4">💸 Withdraw Asset</h2>

      <p className="mb-4 text-sm text-white/80">
        This will attempt to withdraw your locked asset. It only works if the asset is already unlocked by a valid proof or guardian vote.
      </p>

      <button
        onClick={handleWithdraw}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-md text-white text-sm font-medium shadow transition ${
          loading ? "bg-pink-400" : "bg-pink-600 hover:bg-pink-700"
        }`}
      >
        {loading ? "Withdrawing..." : "Withdraw Now"}
      </button>

      {status && (
        <p
          className={`mt-4 text-sm ${
            status.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {status.message}
        </p>
      )}

      {txHash && (
        <a
          href={`https://sepolia.starkscan.co/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline mt-2 block text-sm"
        >
          View transaction on StarkScan ↗
        </a>
      )}
    </div>
  );
};

export default Withdraw;
