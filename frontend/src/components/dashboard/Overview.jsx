import React from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { Link } from 'react-router-dom';
import { FaChartLine, FaWallet, FaExchangeAlt, FaArrowRight } from 'react-icons/fa';

const Overview = ({ marketData }) => {
  const { profile, riskProfile } = useUserProfile();

  if (!marketData) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-cyber-purple bg-opacity-30 rounded mb-4"></div>
        <div className="h-32 bg-cyber-purple bg-opacity-20 rounded"></div>
      </div>
    );
  }

  const getRiskColor = () => {
    if (riskProfile === 'conservative') return 'text-cyber-blue';
    if (riskProfile === 'aggressive') return 'text-cyber-pink';
    return 'text-cyber-yellow';
  };

  const getMarketTrendColor = () => {
    if (marketData.marketTrend === 'bullish') return 'text-green-500';
    if (marketData.marketTrend === 'bearish') return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="card">
      <h2 className="text-xl font-cyber mb-4 flex items-center">
        <FaChartLine className="text-cyber-blue mr-2" />
        <span>Market Overview</span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-3">
          <div className="text-gray-400 text-xs mb-1">ETH Price</div>
          <div className="text-lg font-bold text-cyber-blue">
            ${marketData.ethPrice?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className="glass-panel p-3">
          <div className="text-gray-400 text-xs mb-1">Gas Price</div>
          <div className="text-lg font-bold text-cyber-yellow">
            {marketData.gasPrice || '0'} gwei
          </div>
        </div>
        
        <div className="glass-panel p-3">
          <div className="text-gray-400 text-xs mb-1">Market Trend</div>
          <div className={`text-lg font-bold capitalize ${getMarketTrendColor()}`}>
            {marketData.marketTrend?.trend || 'neutral'}
          </div>
        </div>
        
        <div className="glass-panel p-3">
          <div className="text-gray-400 text-xs mb-1">Your Risk Profile</div>
          <div className={`text-lg font-bold capitalize ${getRiskColor()}`}>
            {riskProfile || 'moderate'}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 glass-panel p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-cyber-pink flex items-center">
              <FaWallet className="mr-2" />
              <span className="font-cyber text-sm">Investment Capital</span>
            </div>
            <div className="text-sm text-gray-400">(Set in Profile)</div>
          </div>
          <div className="text-2xl font-bold">${profile.capital?.toLocaleString() || '0'}</div>
        </div>
        
        <div className="flex-1 glass-panel p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-cyber-yellow flex items-center">
              <FaExchangeAlt className="mr-2" />
              <span className="font-cyber text-sm">Time Horizon</span>
            </div>
            <div className="text-sm text-gray-400">(Set in Profile)</div>
          </div>
          <div className="text-2xl font-bold">{profile.timeHorizon || 0} months</div>
        </div>
      </div>

      <Link to="/strategy" className="flex items-center justify-between p-3 border border-cyber-purple hover:border-cyber-blue rounded-md transition-colors group">
        <span className="font-cyber text-sm">View Your Personalized Strategy</span>
        <FaArrowRight className="text-cyber-blue group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

export default Overview;