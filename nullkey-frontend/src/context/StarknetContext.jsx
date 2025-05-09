import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
  } from "react";
  import { Provider, Contract } from "starknet";
  import { connect, disconnect } from "@starknet-io/get-starknet";
  import { NULLKEY_ABI, CONTRACT_ADDRESS } from "../constants/contract";
  
  const StarknetContext = createContext();
  
  export const useStarknet = () => useContext(StarknetContext);
  
  export const StarknetProvider = ({ children }) => {
    const [wallet, setWallet] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
  
    const connectWallet = useCallback(async () => {
      const connector = await connect({
        modalMode: "alwaysAsk", // shows wallet list
        wallet: "argentX",
      });
  
      if (!connector) {
        throw new Error("No wallet detected. Please install ArgentX.");
      }
  
      await connector.enable();
  
      if (!connector.account) {
        throw new Error("Wallet connection failed.");
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
  