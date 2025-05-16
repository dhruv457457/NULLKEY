import WalletConnect from "./WalletConnect";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-[#0F172A] border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <Link to="/">
        <h1 className="text-2xl font-bold text-[#00FFFF]">NullKey</h1>
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/lock" className="text-white hover:text-[#00FFFF] text-sm font-medium">
          Lock Asset
        </Link>
        <Link to="/dashboard" className="text-white hover:text-[#00FFFF] text-sm font-medium">
          Dashboard
        </Link>
        <WalletConnect />
      </div>
    </nav>
  );
};

export default Navbar;
