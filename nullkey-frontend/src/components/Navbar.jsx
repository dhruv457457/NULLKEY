import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Lock Info", path: "/lock-info" },
    { name: "Submit Proof", path: "/submit-proof" },
    { name: "Withdraw", path: "/withdraw" },
  ];

  return (
    <nav className="w-full px-6 py-4 backdrop-blur-md bg-white/10 border-b border-white/10 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide text-white">
          🔐 NullKey
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium hover:text-pink-300 transition ${
                pathname === link.path ? "text-pink-400 underline" : "text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Placeholder for Wallet Connect */}
          <button className="ml-4 px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-sm rounded-md shadow-md transition">
            Connect Wallet
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
