import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { FaWallet, FaEthereum } from 'react-icons/fa';
import { motion } from 'framer-motion';

const WalletConnect = () => {
  const { address, balance, connectWallet, isConnecting, error } = useWallet();

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6"
    >
      <h2 className="text-xl font-cyber mb-4 flex items-center">
        <FaWallet className="text-cyber-blue mr-2" />
        <span>Connect Your Wallet</span>
      </h2>

      {!address ? (
        <div className="text-center">
          <p className="text-gray-300 mb-5">
            Connect your Ethereum wallet to receive personalized DeFi strategies and manage your investments.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="cyber-button w-full"
          >
            {isConnecting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              'Connect Wallet'
            )}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-cyber-pink bg-opacity-20 border border-cyber-pink rounded-md text-sm text-white">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4 p-3 bg-cyber-purple bg-opacity-20 border border-cyber-purple rounded-md">
            <div className="font-mono text-sm truncate">{formatAddress(address)}</div>
            <div className="px-2 py-1 bg-cyber-black rounded-md text-cyber-yellow flex items-center">
              <FaEthereum className="mr-1" />
              {parseFloat(balance).toFixed(4)}
            </div>
          </div>
          <p className="text-green-400 text-center mb-3 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Wallet connected successfully
          </p>
          <button
            onClick={() => window.location.reload()}
            className="border border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-cyber-black transition-colors w-full py-2 rounded-md font-cyber text-sm"
          >
            Refresh Data
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default WalletConnect;