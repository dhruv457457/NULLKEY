import { useState } from "react";

const Withdraw = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleWithdraw = async () => {
    setLoading(true);
    setStatus(null);

    try {
      // 👉 Replace this with real Starknet invoke
      console.log("Calling withdraw()...");

      // Simulate success after 1s
      setTimeout(() => {
        setStatus({ success: true });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus({ success: false });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-white">🎁 Withdraw NFT</h2>

      <p className="text-gray-300 mb-6">
        If your locker is unlocked, you can now withdraw your NFT securely back to your wallet.
      </p>

      <button
        onClick={handleWithdraw}
        disabled={loading}
        className="w-full py-2 bg-pink-600 hover:bg-pink-700 rounded-md text-white font-semibold transition"
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>

      {status && (
        <div
          className={`mt-4 text-sm font-medium ${
            status.success ? "text-green-400" : "text-red-400"
          }`}
        >
          {status.success
            ? "✅ NFT successfully withdrawn!"
            : "❌ Withdrawal failed. Please try again."}
        </div>
      )}
    </div>
  );
};

export default Withdraw;
