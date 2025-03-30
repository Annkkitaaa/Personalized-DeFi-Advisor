import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaShieldAlt, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { useUserProfile } from '../../contexts/UserProfileContext';

const StrategyCard = ({ marketData }) => {
  const { riskProfile } = useUserProfile();

  // Get strategy recommendation based on risk profile and market trend
  const getStrategyRecommendation = () => {
    const marketTrend = marketData?.marketTrend?.trend?.trend  || 'neutral';
    
    if (riskProfile === 'conservative') {
      if (marketTrend === 'bearish') {
        return {
          name: 'Stablecoin Yield',
          description: 'Focus on capital preservation with stablecoin lending in major protocols',
          expectedReturn: '3-5%',
          riskLevel: 'Low',
          protocols: ['Aave', 'Compound']
        };
      } else {
        return {
          name: 'Diversified Lending',
          description: 'Balance stablecoin lending with small ETH position for upside potential',
          expectedReturn: '4-7%',
          riskLevel: 'Low-Medium',
          protocols: ['Aave', 'Compound', 'Curve']
        };
      }
    } else if (riskProfile === 'aggressive') {
      if (marketTrend === 'bearish') {
        return {
          name: 'Strategic Position Building',
          description: 'Dollar-cost average into ETH while maintaining stablecoin reserves',
          expectedReturn: '10-18%',
          riskLevel: 'High',
          protocols: ['Aave', 'Uniswap', 'Curve']
        };
      } else {
        return {
          name: 'Leveraged Yield Farming',
          description: 'Utilize lending platforms to amplify returns through strategic borrowing',
          expectedReturn: '15-25%',
          riskLevel: 'Very High',
          protocols: ['Aave', 'Compound', 'Uniswap']
        };
      }
    } else { // moderate
      if (marketTrend === 'bearish') {
        return {
          name: 'Balanced Protection',
          description: 'Increase stablecoin allocation while maintaining some ETH exposure',
          expectedReturn: '6-10%',
          riskLevel: 'Medium',
          protocols: ['Aave', 'Compound', 'Curve']
        };
      } else {
        return {
          name: 'Growth Strategy',
          description: 'Balance stablecoins with ETH and liquidity provision for higher yields',
          expectedReturn: '8-15%',
          riskLevel: 'Medium-High',
          protocols: ['Aave', 'Uniswap', 'Curve']
        };
      }
    }
  };

  const strategy = getStrategyRecommendation();

  const getRiskColor = (risk) => {
    if (risk.toLowerCase().includes('low')) return 'text-cyber-blue';
    if (risk.toLowerCase().includes('high')) return 'text-cyber-pink';
    return 'text-cyber-yellow';
  };

  return (
    <div className="card">
      <h2 className="text-xl font-cyber mb-4 flex items-center">
        <FaShieldAlt className="text-cyber-blue mr-2" />
        <span>Recommended Strategy</span>
      </h2>
      
      <div className="glass-panel p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-cyber text-cyber-blue">{strategy.name}</h3>
          <div className={`px-2 py-1 rounded-full text-xs ${getRiskColor(strategy.riskLevel)} bg-opacity-20 bg-gray-800 border border-opacity-30 border-current`}>
            {strategy.riskLevel} Risk
          </div>
        </div>
        <p className="text-gray-300 mb-4">{strategy.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xs text-gray-400">Expected Return</div>
            <div className="text-cyber-yellow font-bold">{strategy.expectedReturn}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Protocols</div>
            <div className="text-cyber-pink">{strategy.protocols.join(', ')}</div>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-10 pt-4 mt-4 flex justify-between items-center">
          <div className="flex items-center text-yellow-500 text-sm">
            <FaExclamationTriangle className="mr-2" />
            <span>Market conditions affect results</span>
          </div>
          <Link to="/strategy" className="text-cyber-blue hover:text-white flex items-center text-sm font-cyber">
            <span>Full Strategy</span>
            <FaArrowRight className="ml-1" />
          </Link>

        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-400">
          <FaChartLine className="mr-2 text-cyber-blue" />
          <span>Based on current market trend: </span>
          <span className={`ml-1 font-bold ${
            marketData?.marketTrend?.trend?.trend?.trend === 'bullish' ? 'text-green-500' : 
            marketData?.marketTrend?.trend?.trend === 'bearish' ? 'text-red-500' : 
            'text-yellow-500'
          }`}>
            {marketData?.marketTrend?.trend?.trend || 'neutral'}
          </span>
        </div>
        <Link to="/strategy" className="text-xs font-cyber px-3 py-1 border border-cyber-purple hover:border-cyber-blue rounded-md transition-colors">
          CUSTOMIZE
        </Link>
      </div>
    </div>
  );
};

export default StrategyCard;