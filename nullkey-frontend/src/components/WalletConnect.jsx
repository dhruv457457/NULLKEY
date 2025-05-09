import { useState } from "react";
import { useStarknet } from "../context/StarknetContext";

const WalletConnect = () => {
  const { connectWallet, disconnectWallet, isConnected, account } = useStarknet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await connectWallet();
    } catch (err) {
      setError(err.message || "Connection failed.");
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    try {
      await disconnectWallet();
    } catch (err) {
      setError(err.message || "Disconnect failed.");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white shadow transition ${
            isConnecting ? "bg-pink-400" : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-white text-sm bg-white/10 px-3 py-1.5 rounded-md border border-white/20">
            {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
          </span>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-sm text-white rounded-md transition"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
