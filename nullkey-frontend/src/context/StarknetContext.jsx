import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { Contract } from "starknet";
import { connect, disconnect } from "@argent/get-starknet";
import { NULLKEY_ABI, CONTRACT_ADDRESS } from "../utils/contract";

const StarknetContext = createContext();
export const useStarknet = () => useContext(StarknetContext);

export const StarknetProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      const connector = await connect({
        modalMode: "alwaysAsk",          // or "neverAsk"
        include: ["argentX"],            // only show ArgentX
      });

      if (!connector) {
        throw new Error("No wallet found. Please install ArgentX.");
      }

      await connector.enable();

      if (!connector.account) {
        throw new Error("Wallet connected but no account found.");
      }

      const userAccount = connector.account;

      const contractInstance = new Contract(
        NULLKEY_ABI,
        CONTRACT_ADDRESS,
        userAccount
      );

      setWallet(connector);
      setAccount(userAccount);
      setContract(contractInstance);
      setIsConnected(true);
    } catch (err) {
      console.error("Connection Error:", err);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    await disconnect();
    setWallet(null);
    setAccount(null);
    setContract(null);
    setIsConnected(false);
  }, []);

  return (
    <StarknetContext.Provider
      value={{
        wallet,
        account,
        contract,
        isConnected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </StarknetContext.Provider>
  );
};
