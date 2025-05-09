import { useState } from "react";
import { useStarknet } from "../context/StarknetContext";

const SubmitProof = () => {
  const { contract, isConnected } = useStarknet();
  const [proof, setProof] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isConnected || !contract) {
      setStatus({ type: "error", message: "Connect your wallet first." });
      return;
    }

    if (!proof.trim()) {
      setStatus({ type: "error", message: "Please enter a valid proof." });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      const tx = await contract.submit_proof(proof);
      setStatus({
        type: "success",
        message: `Proof submitted! Tx hash: ${tx.transaction_hash}`,
      });
    } catch (err) {
      console.error("Submit failed:", err);
      setStatus({ type: "error", message: err.message || "Submit failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white max-w-xl mx-auto p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
      <h2 className="text-2xl font-semibold mb-4">🔐 Submit Ownership Proof</h2>

      <input
        type="text"
        placeholder="Enter your secret proof (felt252 hash)"
        value={proof}
        onChange={(e) => setProof(e.target.value)}
        className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md shadow-md transition w-full"
      >
        {loading ? "Submitting..." : "Submit Proof"}
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
    </div>
  );
};

export default SubmitProof;
