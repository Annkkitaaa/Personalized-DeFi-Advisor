import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaShieldAlt, FaRobot, FaEthereum } from 'react-icons/fa';
import RiskProfiler from '../components/onboarding/RiskProfiler';

const Home = () => {
  return (
    <div className="py-8 md:py-16">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16 md:mb-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="text-white">The Future of </span>
          <span className="text-cyber-blue glow-text">DeFi</span>
          <span className="text-white"> Meets </span>
          <span className="text-cyber-pink glow-text">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Personalized DeFi strategies powered by artificial intelligence.
          Maximize your yields based on real-time blockchain data and your risk profile.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/dashboard" className="cyber-button">
            Launch App
          </Link>
          <a href="#riskprofile" className="border-2 border-cyber-purple hover:border-cyber-blue text-white px-6 py-3 rounded-md font-cyber uppercase tracking-wider font-bold transition-all duration-300">
            Get Started
          </a>
        </div>
      </motion.div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 md:mb-24">
        <Link to="/dashboard">
          <FeatureCard 
            icon={<FaRocket className="text-cyber-pink" size={36} />}
            title="Intelligent Analysis"
            description="Our AI analyzes real-time blockchain data to identify the most profitable opportunities across DeFi protocols."
          />
        </Link>
        <Link to="/#riskprofile">
          <FeatureCard 
            icon={<FaShieldAlt className="text-cyber-blue" size={36} />}
            title="Risk Assessment"
            description="Personalized risk evaluation ensures strategies match your comfort level and investment goals."
          />
        </Link>
        <Link to="/strategy">
          <FeatureCard 
            icon={<FaRobot className="text-cyber-yellow" size={36} />}
            title="Smart Contracts"
            description="Seamlessly interact with DeFi protocols through our secure smart contract integration."
          />
        </Link>
      </div>
      
      {/* Risk Profile Section */}
      <motion.div 
        id="riskprofile"
        className="max-w-4xl mx-auto rounded-2xl overflow-hidden glass-panel p-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">
          <span className="text-cyber-blue">Find</span> Your Strategy
        </h2>
        <RiskProfiler />
      </motion.div>
      
      {/* Protocols Section */}
      <div className="mt-16 md:mt-24 text-center">
        <h2 className="text-2xl font-bold mb-10">Supported Protocols</h2>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          <ProtocolLogo name="Aave" />
          <ProtocolLogo name="Compound" />
          <ProtocolLogo name="Uniswap" />
          <ProtocolLogo name="Curve" />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    className="card border border-white border-opacity-10 hover:border-cyber-blue transition-all duration-300 cursor-pointer h-full"
    whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(45, 226, 230, 0.2)' }}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-cyber-blue">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

const ProtocolLogo = ({ name }) => (
  <div className="flex flex-col items-center group">
    <div className="w-16 h-16 rounded-full bg-card-bg border border-cyber-purple group-hover:border-cyber-blue transition-colors flex items-center justify-center mb-2">
      {name === "Aave" ? (
        <span className="text-xl font-bold text-cyber-blue">Aa</span>
      ) : name === "Compound" ? (
        <span className="text-xl font-bold text-cyber-blue">Co</span>
      ) : name === "Uniswap" ? (
        <span className="text-xl font-bold text-cyber-pink">🦄</span>
      ) : name === "Curve" ? (
        <span className="text-xl font-bold text-cyber-yellow">Cv</span>
      ) : (
        <FaEthereum className="text-cyber-blue" size={24} />
      )}
    </div>
    <span className="text-sm group-hover:text-cyber-blue transition-colors">{name}</span>
  </div>
);

export default Home;