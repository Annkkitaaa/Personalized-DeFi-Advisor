import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { FaWallet, FaChartLine, FaHome, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { address, connectWallet, disconnectWallet, balance } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <FaHome /> },
    { name: 'Dashboard', path: '/dashboard', icon: <FaChartLine /> },
    { name: 'Strategy', path: '/strategy', icon: <FaWallet /> },
  ];

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-cyber-black bg-opacity-90 backdrop-blur-md py-4 border-b border-cyber-blue border-opacity-30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-cyber-blue flex items-center justify-center">
              <span className="font-cyber text-cyber-black text-xl font-bold">N</span>
            </div>
            <span className="font-cyber text-2xl tracking-wider text-white">
              NEXUS<span className="text-cyber-blue">AI</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`relative font-cyber text-sm tracking-wider flex items-center space-x-1 ${
                    location.pathname === link.path ? 'text-cyber-blue' : 'text-white hover:text-cyber-blue'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                  {location.pathname === link.path && (
                    <motion.div 
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cyber-blue"
                      initial={false}
                    />
                  )}
                </Link>
              ))}
            </div>
            
            {address ? (
              <div className="flex items-center space-x-4">
                {balance && (
                  <div className="text-sm font-mono bg-cyber-black bg-opacity-50 px-3 py-1 rounded-md">
                    <span className="text-cyber-yellow">{parseFloat(balance).toFixed(4)} ETH</span>
                  </div>
                )}
                <div className="px-4 py-2 rounded-md bg-cyber-purple bg-opacity-30 border border-cyber-purple">
                  <span className="text-sm font-mono">{formatAddress(address)}</span>
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="text-xs font-cyber px-3 py-1 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white rounded-md transition-colors"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="cyber-button"
              >
                CONNECT WALLET
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col space-y-3 pb-3">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`font-cyber text-sm py-2 px-4 rounded-md flex items-center space-x-2 ${
                  location.pathname === link.path ? 'bg-cyber-purple text-white' : 'text-white hover:bg-cyber-purple hover:bg-opacity-30'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
            
            {address ? (
              <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-white border-opacity-10">
                {balance && (
                  <div className="text-sm font-mono bg-cyber-black bg-opacity-50 px-3 py-2 rounded-md">
                    <span className="text-cyber-yellow">{parseFloat(balance).toFixed(4)} ETH</span>
                  </div>
                )}
                <div className="px-4 py-2 rounded-md bg-cyber-purple bg-opacity-30 border border-cyber-purple">
                  <span className="text-sm font-mono">{formatAddress(address)}</span>
                </div>
                <button 
                  onClick={() => {
                    disconnectWallet();
                    setIsMenuOpen(false);
                  }}
                  className="text-xs font-cyber px-3 py-2 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white rounded-md transition-colors"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  connectWallet();
                  setIsMenuOpen(false);
                }}
                className="cyber-button mt-4"
              >
                CONNECT WALLET
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;