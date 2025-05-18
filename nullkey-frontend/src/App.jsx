import { Routes, Route } from 'react-router-dom';
import { StarknetProvider } from './context/StarknetContext';
import Home from './pages/Home';
import LockAsset from './pages/Lock';
import Dashboard from './pages/Dash';
import NotFound from './pages/Not';
import Navbar from './components/Navbar';

function App() {
  return (
    <StarknetProvider>
      <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-sans">
        <Navbar />
        <main className="px-6 md:px-8 py-12 md:py-16 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lock" element={<LockAsset />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </StarknetProvider>
  );
}  

export default App;
