import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet found. Please install MetaMask.");
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethSigner = ethProvider.getSigner();
      const network = await ethProvider.getNetwork();
      const ethBalance = await ethSigner.getBalance();
      
      setAddress(accounts[0]);
      setProvider(ethProvider);
      setSigner(ethSigner);
      setChainId(network.chainId);
      setBalance(ethers.utils.formatEther(ethBalance));
      
      localStorage.setItem('walletConnected', 'true');
    } catch (err) {
      setError(err.message);
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance(null);
    localStorage.removeItem('walletConnected');
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
          updateBalance(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      // Check if we should auto-connect
      if (localStorage.getItem('walletConnected') === 'true') {
        connectWallet();
      }
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const updateBalance = async (address) => {
    if (provider && address) {
      try {
        const ethBalance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(ethBalance));
      } catch (err) {
        console.error("Error updating balance:", err);
      }
    }
  };

  // Keep balance updated
  useEffect(() => {
    if (address && provider) {
      updateBalance(address);
      
      // Update every minute
      const interval = setInterval(() => updateBalance(address), 60000);
      return () => clearInterval(interval);
    }
  }, [address, provider]);

  return (
    <WalletContext.Provider value={{
      address,
      provider,
      signer,
      isConnecting,
      error,
      chainId,
      balance,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;