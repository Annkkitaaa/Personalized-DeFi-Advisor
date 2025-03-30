// frontend/src/pages/Strategy.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { getAdvice } from '../services/api';
import { FaChevronUp, FaChevronDown, FaExclamationCircle, FaCheckCircle, FaEthereum, FaWallet, FaRobot } from 'react-icons/fa';

// Import components for each section
import AssetAllocationSection from '../components/strategy/AssetAllocationSection';
import ProtocolsSection from '../components/strategy/ProtocolsSection';
import ImplementationSteps from '../components/strategy/ImplementationSteps';
import ExpectedReturns from '../components/strategy/ExpectedReturns';
import RiskFactors from '../components/strategy/RiskFactors';
import MarketInsights from '../components/strategy/MarketInsights';
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
          console.log("Received advice data:", response.advice);
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
          {summary ? (
            <p className="text-gray-300">{summary}</p>
          ) : (
            <p className="text-gray-400 text-center">No strategy summary available. Try regenerating the strategy.</p>
          )}
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
              <AssetAllocationSection allocation={allocation} />
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
              <ProtocolsSection protocols={protocols} steps={steps} />
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
              <ImplementationSteps steps={steps} />
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
                <ExpectedReturns expectedReturns={expectedReturns} />
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
                <RiskFactors risks={risks} />
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
              <MarketInsights marketInsights={marketInsights} topOpportunities={topOpportunities} />
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
                ethPrice={marketInsights?.ethPrice} 
                gasPrice={marketInsights?.gasPrice} 
              />
            </motion.div>
          )}
        </div>
        
        {/* Disclaimer */}
        <div className="glass-panel p-4 flex items-start mb-4">
          <FaExclamationCircle className="text-cyber-pink mt-1 mr-3 flex-shrink-0" />
          <p className="text-gray-400 text-sm">{advice?.disclaimer || "This is AI-generated financial advice based on real-time blockchain data. Always conduct your own research before making investment decisions."}</p>
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