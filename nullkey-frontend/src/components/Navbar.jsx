import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import WalletConnect from "./WalletConnect";

const Navbar = () => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Lock Info", path: "/lock-info" },
    { name: "Submit Proof", path: "/submit-proof" },
    { name: "Withdraw", path: "/withdraw" },
  ];

  return (
    <nav className="w-full backdrop-blur-md bg-white/10 border-b border-white/10 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide text-white">
          🔐 NullKey
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition ${
                pathname === link.path ? "text-pink-400 underline" : "text-white hover:text-pink-300"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <WalletConnect />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#2c0a11] px-4 pb-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium transition ${
                pathname === link.path
                  ? "text-pink-400 underline"
                  : "text-white hover:text-pink-300"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-2">
            <WalletConnect />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;