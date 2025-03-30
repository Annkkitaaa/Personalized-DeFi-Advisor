import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { getAdvice } from '../services/api';
import { FaChevronUp, FaChevronDown, FaExclamationCircle, FaCheckCircle, FaEthereum, FaWallet } from 'react-icons/fa';

const Strategy = () => {
  const { address } = useWallet();
  const { profile, isProfileComplete, riskProfile } = useUserProfile();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('allocation');
  const navigate = useNavigate();

  useEffect(() => {
    // If profile isn't complete, redirect to home for setup
    if (!isProfileComplete) {
      navigate('/#riskprofile');
      return;
    }

    const fetchAdvice = async () => {
      setLoading(true);
      try {
        const response = await getAdvice(profile, address);
        setAdvice(response.advice);
        setError(null);
      } catch (err) {
        console.error('Error fetching strategy advice:', err);
        setError('Failed to generate strategy. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [profile, address, isProfileComplete, navigate]);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <FaEthereum className="text-cyber-blue animate-pulse" size={24} />
          </div>
        </div>
        <p className="mt-4 text-white font-cyber">Generating your personalized strategy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-cyber-pink text-5xl mb-4">
          <FaExclamationCircle />
        </div>
        <h2 className="text-xl font-cyber mb-2">Strategy Generation Failed</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="cyber-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!advice) {
    return null;
  }

  return (
    <div className="py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-cyber">
            <span className="text-white">Your</span>
            <span className="text-cyber-pink"> Strategy</span>
          </h1>
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <FaWallet className="text-cyber-blue" />
            <span className="text-sm">Risk Profile: <span className={
              riskProfile === 'conservative' ? 'text-cyber-blue' :
              riskProfile === 'aggressive' ? 'text-cyber-pink' :
              'text-cyber-yellow'
            }>{riskProfile}</span></span>
          </div>
        </div>
        
        {/* Summary Card */}
        <div className="card mb-6">
          <h2 className="text-xl font-cyber mb-4">Strategy Summary</h2>
          <p className="text-gray-300">{advice.summary}</p>
        </div>
        
        {/* Asset Allocation Section */}
        <div className="card mb-6">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('allocation')}
          >
            <h2 className="text-xl font-cyber">Asset Allocation</h2>
            <span>{activeSection === 'allocation' ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          
          {activeSection === 'allocation' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="space-y-4">
                {Object.entries(advice.allocation).map(([asset, percentage]) => (
                  <div key={asset}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">{asset}</span>
                      <span className="text-cyber-blue">{percentage}</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-10 rounded-full h-2.5">
                      <div 
                        className={`${
                          asset.toLowerCase().includes('stable') ? 'bg-cyber-blue' :
                          asset.toLowerCase().includes('ethereum') ? 'bg-cyber-yellow' :
                          'bg-cyber-pink'
                        } h-full rounded-full`}
                        style={{ width: `${parseFloat(percentage) || 50}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Recommended Protocols */}
        <div className="card mb-6">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('protocols')}
          >
            <h2 className="text-xl font-cyber">Recommended Protocols</h2>
            <span>{activeSection === 'protocols' ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          
          {activeSection === 'protocols' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {advice.protocols.map((protocol, index) => (
                  <div 
                    key={index}
                    className="glass-panel p-4 flex flex-col items-center text-center hover:border-cyber-blue transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-card-bg border border-cyber-purple flex items-center justify-center mb-2">
                      {protocol.toLowerCase().includes('aave') ? (
                        <span className="text-lg font-bold text-cyber-blue">Aa</span>
                      ) : protocol.toLowerCase().includes('compound') ? (
                        <span className="text-lg font-bold text-cyber-blue">Co</span>
                      ) : protocol.toLowerCase().includes('uniswap') ? (
                        <span className="text-lg font-bold text-cyber-pink">🦄</span>
                      ) : protocol.toLowerCase().includes('curve') ? (
                        <span className="text-lg font-bold text-cyber-yellow">Cv</span>
                      ) : (
                        <FaEthereum className="text-cyber-blue" size={20} />
                      )}
                    </div>
                    <span className="text-sm">{protocol}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Implementation Steps */}
        <div className="card mb-6">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('steps')}
          >
            <h2 className="text-xl font-cyber">Implementation Steps</h2>
            <span>{activeSection === 'steps' ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          
          {activeSection === 'steps' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <ol className="space-y-4">
                {advice.steps.map((step, index) => (
                  <li key={index} className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-purple flex items-center justify-center mr-3">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="pt-1">
                      <p className="text-gray-300">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </div>
        
        {/* Expected Returns & Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Expected Returns */}
          <div className="card">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('returns')}
            >
              <h2 className="text-xl font-cyber">Expected Returns</h2>
              <span>{activeSection === 'returns' ? <FaChevronUp /> : <FaChevronDown />}</span>
            </div>
            
            {activeSection === 'returns' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-cyber-yellow mb-2">
                    {advice.expectedReturns.min}% - {advice.expectedReturns.max}%
                  </div>
                  <div className="text-gray-400 mb-4">
                    {advice.expectedReturns.timeframe}
                  </div>
                  <div className="w-full h-2 bg-white bg-opacity-10 rounded-full mb-2">
                    <div 
                      className="bg-gradient-to-r from-cyber-blue via-cyber-yellow to-cyber-pink h-full rounded-full"
                      style={{ width: `${(advice.expectedReturns.min + advice.expectedReturns.max) / 2 * 5}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Risks */}
          <div className="card">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('risks')}
            >
              <h2 className="text-xl font-cyber">Risk Factors</h2>
              <span>{activeSection === 'risks' ? <FaChevronUp /> : <FaChevronDown />}</span>
            </div>
            
            {activeSection === 'risks' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <ul className="space-y-2">
                  {advice.risks.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <FaExclamationCircle className="text-cyber-pink mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">{risk}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Market Insights */}
        <div className="card mb-8">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('market')}
          >
            <h2 className="text-xl font-cyber">Market Insights</h2>
            <span>{activeSection === 'market' ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          
          {activeSection === 'market' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-4">
                  <div className="text-gray-400 text-sm mb-1">ETH Price</div>
                  <div className="text-xl font-bold text-cyber-blue">${advice.marketInsights.ethPrice.toFixed(2)}</div>
                </div>
                <div className="glass-panel p-4">
                  <div className="text-gray-400 text-sm mb-1">Gas Price</div>
                  <div className="text-xl font-bold text-cyber-yellow">{advice.marketInsights.gasPrice} gwei</div>
                </div>
                <div className="glass-panel p-4">
                  <div className="text-gray-400 text-sm mb-1">Market Trend</div>
                  <div className={`text-xl font-bold ${
                    advice.marketInsights.trend === 'bullish' ? 'text-green-500' :
                    advice.marketInsights.trend === 'bearish' ? 'text-red-500' :
                    'text-yellow-500'
                  }`}>
                    {advice.marketInsights.trend.charAt(0).toUpperCase() + advice.marketInsights.trend.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-cyber text-md mb-2">Top Opportunities</h3>
                <div className="space-y-2">
                {advice.topOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border border-white border-opacity-10 rounded-md">
                    <div>
                      <span className="text-cyber-blue">{opportunity.protocol}</span>
                      <span className="text-gray-400"> - {opportunity.asset}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-cyber-yellow font-bold mr-2">{opportunity.apy.toFixed(2)}%</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        opportunity.risk <= 4 ? 'bg-cyber-blue bg-opacity-20 text-cyber-blue' :
                        opportunity.risk <= 7 ? 'bg-cyber-yellow bg-opacity-20 text-cyber-yellow' :
                        'bg-cyber-pink bg-opacity-20 text-cyber-pink'
                      }`}>Risk: {opportunity.risk}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Disclaimer */}
        <div className="glass-panel p-4 flex items-start mb-4">
          <FaExclamationCircle className="text-cyber-pink mt-1 mr-3 flex-shrink-0" />
          <p className="text-gray-400 text-sm">{advice.disclaimer}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="border-2 border-cyber-purple hover:border-cyber-blue text-white px-6 py-3 rounded-md font-cyber uppercase tracking-wider font-bold transition-all duration-300 flex-1"
          >
            Back to Dashboard
          </button>
          <button className="cyber-button flex-1">
            Execute Strategy
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Strategy;