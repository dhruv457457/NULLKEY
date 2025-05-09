import { useState } from "react";

const SubmitProof = () => {
  const [proofInput, setProofInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmitProof = async () => {
    setLoading(true);
    setResult(null);

    try {
      // 👉 Replace with real Starknet invoke later
      console.log("Submitting proof:", proofInput);

      // Simulated async call (fake success if proof === "dhruv123")
      setTimeout(() => {
        if (proofInput === "dhruv123") {
          setResult({ success: true });
        } else {
          setResult({ success: false });
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setResult({ success: false });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-white">🔐 Submit Proof</h2>

      <input
        type="text"
        value={proofInput}
        onChange={(e) => setProofInput(e.target.value)}
        placeholder="Enter your recovery secret..."
        className="w-full p-3 rounded-md bg-white/5 border border-white/20 text-white placeholder-gray-300 mb-4"
      />

      <button
        onClick={handleSubmitProof}
        disabled={loading || !proofInput}
        className="w-full py-2 bg-pink-600 hover:bg-pink-700 rounded-md text-white font-semibold transition"
      >
        {loading ? "Submitting..." : "Submit Proof"}
      </button>

      {result && (
        <div className={`mt-4 text-sm font-medium ${result.success ? "text-green-400" : "text-red-400"}`}>
          {result.success ? "✅ Proof accepted. NFT is now unlocked!" : "❌ Invalid proof. Try again."}
        </div>
      )}
    </div>
  );
};

export default SubmitProof;
