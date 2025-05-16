import { useStarknet } from '../context/StarknetContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { isConnected, connectWallet, account } = useStarknet();
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!isConnected) {
      await connectWallet();
    }
    navigate('/dashboard');
  };

  return (
    <div className="text-white flex flex-col justify-center items-center gap-10 py-20 px-6 md:px-10">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-[#00FFFF] leading-tight drop-shadow-md">
          Own It. Lock It. Recover It.<br />
          <span className="text-white">Privately.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300">
          NullKey is your Zero-Knowledge locker for NFTs and tokens on Starknet.
          Lock digital assets with secret proofs, enable heir fallback, and recover them — all without revealing your identity.
        </p>
        <button
          onClick={handleStart}
          className="mt-10 bg-[#00FFFF] text-black font-semibold py-3 px-6 rounded-xl text-lg hover:scale-105 transition-all"
        >
          {isConnected ? 'Go to Dashboard' : 'Connect Wallet to Get Started'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl w-full">
        {[
          {
            title: '🔐 ZK Asset Lock',
            desc: 'Lock NFTs or tokens with a zero-knowledge secret. Only you can unlock.',
          },
          {
            title: '👥 Heir Fallback',
            desc: 'Set a trusted wallet to claim assets if you’re inactive.',
          },
          {
            title: '⏳ Deadman Timer',
            desc: 'Auto-withdrawal to backup wallet after inactivity period.',
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
          >
            <h3 className="text-xl font-semibold text-[#00FFFF] mb-2">{card.title}</h3>
            <p className="text-sm text-gray-300">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
