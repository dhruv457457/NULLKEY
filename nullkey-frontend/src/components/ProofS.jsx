// src/components/ProofSubmit.jsx
import React, { useState } from "react";
import { useStarknet } from "../context/StarknetContext";

const ProofS = () => {
  const { account, contract, isConnected } = useStarknet();

  const [form, setForm] = useState({ lockId: "", secret: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!isConnected || !contract || !account) {
      setStatus("❌ Connect your wallet first.");
      return;
    }

    const { lockId, secret } = form;

    if (!lockId || !secret) {
      setStatus("❌ All fields are required.");
      return;
    }

    try {
      setStatus("🔄 Submitting proof...");

      await contract.submit_proof(BigInt(lockId), secret);

      setStatus("✅ Proof submitted successfully.");
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message || "Submission failed"}`);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="number"
        name="lockId"
        value={form.lockId}
        onChange={handleChange}
        placeholder="Lock ID"
        className="input-style"
      />

      <textarea
        name="secret"
        value={form.secret}
        onChange={handleChange}
        placeholder="Secret used during locking"
        rows={3}
        className="input-style"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-[#00FFFF] text-black font-semibold py-2 rounded-lg hover:scale-105 transition"
      >
        Submit Proof
      </button>

      {status && (
        <p className="text-sm text-white bg-white/10 p-2 rounded-md text-center">
          {status}
        </p>
      )}
    </div>
  );
};

export default ProofS;
