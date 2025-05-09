import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg px-10 py-12 text-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          🔐 Recover. Secure. Unlock.
        </h1>
        <p className="text-lg text-gray-200 mb-8">
          NullKey is a zero-knowledge locker for your NFTs on Starknet. Prove ownership,
          recover assets, and stay private — no seed phrases, no email, no worries.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/submit-proof"
            className="px-6 py-3 rounded-md bg-pink-600 hover:bg-pink-700 transition text-white font-semibold"
          >
            Submit Proof
          </Link>
          <Link
            to="/lock-info"
            className="px-6 py-3 rounded-md bg-white/10 border border-white/20 hover:bg-white/20 transition text-white font-medium"
          >
            View Locker Info
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
