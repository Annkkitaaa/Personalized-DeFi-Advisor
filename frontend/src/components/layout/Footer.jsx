import React from 'react';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-cyber-black border-t border-cyber-blue border-opacity-20 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <div className="w-8 h-8 rounded-full bg-cyber-blue flex items-center justify-center mr-2">
                <span className="font-cyber text-cyber-black text-sm font-bold">N</span>
              </div>
              <span className="font-cyber text-xl tracking-wider text-white">
                NEXUS<span className="text-cyber-blue">AI</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm text-center md:text-left">
              AI-powered DeFi advisor with real-time blockchain data.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-cyber-blue transition-colors">
                <FaGithub size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyber-blue transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyber-blue transition-colors">
                <FaDiscord size={20} />
              </a>
            </div>
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} NexusAI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;