import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Contract, RpcProvider } from "starknet";
import { connect, disconnect } from "@argent/get-starknet";
import { NULLKEY_ABI, CONTRACT_ADDRESS, RPC_URL } from "../utils/contr";

// Create React context
const StarknetContext = createContext();
export const useStarknet = () => useContext(StarknetContext);

// Global read-only provider
const provider = new RpcProvider({ nodeUrl: RPC_URL });

export const StarknetProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null); // signer
  const [readContract, setReadContract] = useState(null); // view-only
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      const connector = await connect({
        modalMode: "alwaysAsk",
        include: ["argentX"], // or include Braavos if needed
      });

      if (!connector) {
        throw new Error("No wallet found. Please install ArgentX.");
      }

      await connector.enable();
      if (!connector.account) {
        throw new Error("Wallet connected but no account found.");
      }

      const userAccount = connector.account;

      // Bind contract for signer
      const contractInstance = new Contract(
        NULLKEY_ABI,
        CONTRACT_ADDRESS,
        userAccount
      );

      // Bind view-only contract for reads
      const viewOnlyContract = new Contract(
        NULLKEY_ABI,
        CONTRACT_ADDRESS,
        provider
      );

      setWallet(connector);
      setAccount(userAccount);
      setContract(contractInstance);
      setReadContract(viewOnlyContract);
      setIsConnected(true);
    } catch (err) {
      console.error("Connection Error:", err.message);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    await disconnect();
    setWallet(null);
    setAccount(null);
    setContract(null);
    setReadContract(null);
    setIsConnected(false);
  }, []);

  return (
    <StarknetContext.Provider
      value={{
        wallet,
        account,
        contract,
        readContract,
        isConnected,
        connectWallet,
        disconnectWallet,
        provider,
      }}
    >
      {children}
    </StarknetContext.Provider>
  );
};
