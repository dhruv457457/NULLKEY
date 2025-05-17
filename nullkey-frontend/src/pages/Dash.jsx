
import UserLocks from "../components/User";
import HeirClaims from "../components/HeirClai";
import ProofSubmit from "../components/ProofS";

const Dash = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6 text-white">
      <h2 className="text-4xl font-bold mb-10 text-center text-[#00FFFF] drop-shadow-lg">
        🧿 My Locker Dashboard
      </h2>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {/* View my own locked assets */}
        <section className="glass p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-neon transition">
          <h3 className="text-2xl font-semibold mb-4 text-white/90">🔐 Your Active Locks</h3>
          <UserLocks />
        </section>

        {/* Prove ownership for any lock */}
        <section className="glass p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-neon transition">
          <h3 className="text-2xl font-semibold mb-4 text-white/90">🧠 Submit Proof</h3>
          <ProofSubmit />
        </section>

        {/* If you're a heir to someone's asset */}
        <section className="glass p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-neon transition">
          <h3 className="text-2xl font-semibold mb-4 text-white/90">🧬 Heir Claims</h3>
          <HeirClaims />
        </section>
      </div>
    </div>
  );
};

export default Dash;
