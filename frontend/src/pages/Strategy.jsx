// frontend/src/pages/Strategy.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { getAdvice } from '../services/api';
import { FaChevronUp, FaChevronDown, FaExclamationCircle, FaCheckCircle, FaEthereum, FaWallet, FaRobot } from 'react-icons/fa';
import SmartContractSimulation from '../components/strategy/SmartContractSimulation';

const Strategy = () => {
  const { address } = useWallet();
  const { profile, isProfileComplete, riskProfile } = useUserProfile();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('allocation');
  const navigate = useNavigate();

  // Helper function to extract safe data from API response
  const extractSafeData = (advice) => {
    if (!advice) return {
      summary: '',
      allocation: {},
      protocols: [],
      steps: [],
      expectedReturns: { min: null, max: null, timeframe: null },
      risks: [],
      marketInsights: { ethPrice: 0, gasPrice: '0', trend: 'neutral' },
      topOpportunities: []
    };

    return {
      summary: advice.summary || '',
      allocation: advice.allocation || {},
      protocols: Array.isArray(advice.protocols) ? advice.protocols : [],
      steps: Array.isArray(advice.steps) ? advice.steps : [],
      expectedReturns: advice.expectedReturns || { min: null, max: null, timeframe: null },
      risks: Array.isArray(advice.risks) ? advice.risks : [],
      marketInsights: advice.marketInsights || { ethPrice: 0, gasPrice: '0', trend: 'neutral' },
      topOpportunities: Array.isArray(advice.topOpportunities) ? advice.topOpportunities : []
    };
  };

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
        if (response && response.success && response.advice) {
          setAdvice(response.advice);
          setError(null);
        } else {
          throw new Error('Invalid response structure from API');
        }
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

  // Extract safe data from the advice object
  const {
    summary,
    allocation,
    protocols,
    steps,
    expectedReturns,
    risks,
    marketInsights,
    topOpportunities
  } = extractSafeData(advice);

  // Helper function to get color for risk level
  const getRiskColor = (riskLevel) => {
    if (!riskLevel) return 'text-cyber-yellow';
    const level = riskLevel.toLowerCase();
    if (level.includes('low')) return 'text-cyber-blue';
    if (level.includes('high')) return 'text-cyber-pink';
    return 'text-cyber-yellow';
  };

  // Helper function to get color for market trend
  const getTrendColor = (trend) => {
    if (!trend) return 'text-yellow-500';
    const trendLower = trend.toLowerCase();
    if (trendLower.includes('bull')) return 'text-green-500';
    if (trendLower.includes('bear')) return 'text-red-500';
    return 'text-yellow-500';
  };

  // Get proper allocation width for progress bars
  const getProgressWidth = (value) => {
    if (typeof value === 'string') {
      // Handle ranges like "40-60%"
      if (value.includes('-')) {
        const [min, max] = value.replace(/%/g, '').split('-').map(v => parseInt(v.trim()));
        return `${(min + max) / 2}%`;
      }
      // Handle percentages like "40%"
      const match = value.match(/(\d+)/);
      return match ? `${match[1]}%` : '50%';
    }
    if (typeof value === 'number') {
      return `${value}%`;
    }
    return '50%';  // Default
  };

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
          <p className="text-gray-300">{summary}</p>
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
              {Object.keys(allocation).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(allocation).map(([asset, percentage]) => (
                    <div key={asset} className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-white capitalize">{asset}</span>
                        <span className="text-cyber-blue">{percentage}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            asset.toLowerCase().includes('stable') ? 'bg-cyber-blue' :
                            asset.toLowerCase().includes('ethereum') ? 'bg-cyber-yellow' :
                            'bg-cyber-pink'
                          }`}
                          style={{ width: getProgressWidth(percentage) }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center mt-4">No allocation data available</p>
              )}
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
              {protocols.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {protocols.map((protocol, index) => {
                      // Clean protocol name
                      const cleanProtocol = typeof protocol === 'string' 
                        ? protocol.replace(/[\*"]/g, '').trim()
                        : '';

                      // Get appropriate icon
                      const getProtocolIcon = () => {
                        const lowerProtocol = cleanProtocol.toLowerCase();
                        if (lowerProtocol.includes('aave')) {
                          return <div className="text-lg font-bold text-cyber-blue">Aa</div>;
                        } else if (lowerProtocol.includes('compound')) {
                          return <div className="text-lg font-bold text-cyber-blue">Co</div>;
                        } else if (lowerProtocol.includes('uniswap')) {
                          return <div className="text-lg font-bold text-cyber-pink">🦄</div>;
                        } else if (lowerProtocol.includes('curve')) {
                          return <div className="text-lg font-bold text-cyber-yellow">Cv</div>;
                        }
                        return <FaEthereum className="text-cyber-blue" />;
                      };

                      return (
                        <div 
                          key={index}
                          className="glass-panel p-4 flex flex-col items-center text-center"
                        >
                          <div className="w-12 h-12 rounded-full bg-card-bg border border-cyber-purple flex items-center justify-center mb-2">
                            {getProtocolIcon()}
                          </div>
                          <span className="text-sm">{cleanProtocol}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center mt-4">No protocol recommendations available</p>
              )}
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
              {steps.length > 0 ? (
                <ol className="space-y-4">
                  {steps.map((step, index) => (
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
              ) : (
                <p className="text-gray-400 text-center mt-4">No implementation steps available</p>
              )}
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
                {expectedReturns.min !== null && expectedReturns.max !== null ? (
                  <div className="flex flex-col items-center">
                    <div className="text-5xl font-bold text-cyber-yellow mb-2">
                      {expectedReturns.min}% - {expectedReturns.max}%
                    </div>
                    <div className="text-gray-400 mb-4">
                      {expectedReturns.timeframe || '12 months'}
                    </div>
                    <div className="w-full h-2 bg-white bg-opacity-10 rounded-full mb-2">
                      <div 
                        className="bg-gradient-to-r from-cyber-blue via-cyber-yellow to-cyber-pink h-full rounded-full"
                        style={{ width: `${Math.min(100, ((expectedReturns.min + expectedReturns.max) / 2) * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center mt-4">No expected returns data available</p>
                )}
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
                {risks.length > 0 ? (
                  <ul className="space-y-2">
                    {risks.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <FaExclamationCircle className="text-cyber-pink mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{risk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-center mt-4">No risk factors available</p>
                )}
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
                  <div className="text-xl font-bold text-cyber-blue">
                    ${typeof marketInsights.ethPrice === 'number' ? marketInsights.ethPrice.toFixed(2) : '0.00'}
                  </div>
                </div>
                <div className="glass-panel p-4">
                  <div className="text-gray-400 text-sm mb-1">Gas Price</div>
                  <div className="text-xl font-bold text-cyber-yellow">{marketInsights.gasPrice} gwei</div>
                </div>
                <div className="glass-panel p-4">
                  <div className="text-gray-400 text-sm mb-1">Market Trend</div>
                  <div className={`text-xl font-bold ${getTrendColor(marketInsights.trend)}`}>
                    {typeof marketInsights.trend === 'string' && marketInsights.trend.length > 0
                      ? marketInsights.trend.charAt(0).toUpperCase() + marketInsights.trend.slice(1)
                      : 'Neutral'}
                  </div>
                </div>
              </div>
              
              {topOpportunities && topOpportunities.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-cyber text-md mb-2">Top Opportunities</h3>
                  <div className="space-y-2">
                    {topOpportunities.map((opportunity, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border border-white border-opacity-10 rounded-md">
                        <div>
                          <span className="text-cyber-blue">{opportunity.protocol}</span>
                          <span className="text-gray-400"> - {opportunity.asset}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-cyber-yellow font-bold mr-2">
                            {typeof opportunity.apy === 'number' ? opportunity.apy.toFixed(2) : '0.00'}%
                          </span>
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
            </motion.div>
          )}
        </div>

        {/* Smart Contract Simulation */}
        <div className="card mb-6">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('simulation')}
          >
            <h2 className="text-xl font-cyber">Smart Contract Simulation</h2>
            <span>{activeSection === 'simulation' ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          
          {activeSection === 'simulation' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <SmartContractSimulation 
                ethPrice={marketInsights.ethPrice} 
                gasPrice={marketInsights.gasPrice} 
              />
            </motion.div>
          )}
        </div>
        
        {/* Disclaimer */}
        <div className="glass-panel p-4 flex items-start mb-4">
          <FaExclamationCircle className="text-cyber-pink mt-1 mr-3 flex-shrink-0" />
          <p className="text-gray-400 text-sm">{advice.disclaimer || "This is AI-generated financial advice based on real-time blockchain data. Always conduct your own research before making investment decisions."}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="border-2 border-cyber-purple hover:border-cyber-blue text-white px-6 py-3 rounded-md font-cyber uppercase tracking-wider font-bold transition-all duration-300 flex-1"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => {
              if (address) {
                navigate('/dashboard');
              } else {
                alert('Please connect your wallet first to execute strategy.');
              }
            }}
            className="cyber-button flex-1"
          >
            Execute Strategy
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Strategy;