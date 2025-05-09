import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StarknetProvider } from "./context/StarknetContext";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import LockInfo from "./pages/LockInfo";
import SubmitProof from "./pages/SubmitProof";
import Withdraw from "./pages/Withdraw";

function App() {
  return (
    <Router>
      <StarknetProvider>
        <div className="min-h-screen bg-[#2c0a11] text-white font-sans">
          <ToastContainer position="top-right" autoClose={3000} />
          <Navbar />

          <div className="px-4 py-8 max-w-4xl mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lock-info" element={<LockInfo />} />
              <Route path="/submit-proof" element={<SubmitProof />} />
              <Route path="/withdraw" element={<Withdraw />} />
            </Routes>
          </div>
        </div>
      </StarknetProvider>
    </Router>
  );
}

export default App;