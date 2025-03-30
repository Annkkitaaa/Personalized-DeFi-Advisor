// frontend/src/components/strategy/MarketInsights.jsx
import React from 'react';

const MarketInsights = ({ marketInsights, topOpportunities }) => {
  if (!marketInsights) {
    return (
      <div className="p-4 text-center text-gray-400">
        No market insights data available from the API. Try regenerating the strategy.
      </div>
    );
  }

  // Helper function to get color for market trend
  const getTrendColor = (trend) => {
    if (!trend) return 'text-yellow-500';
    const trendLower = trend.toLowerCase();
    if (trendLower.includes('bull')) return 'text-green-500';
    if (trendLower.includes('bear')) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <div className="text-gray-400 text-sm mb-1">ETH Price</div>
          <div className="text-xl font-bold text-cyber-blue">
            ${typeof marketInsights.ethPrice === 'number' ? marketInsights.ethPrice.toFixed(2) : '0.00'}
          </div>
        </div>
        <div className="glass-panel p-4">
          <div className="text-gray-400 text-sm mb-1">Gas Price</div>
          <div className="text-xl font-bold text-cyber-yellow">{marketInsights.gasPrice || '0'} gwei</div>
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
    </div>
  );
};

export default MarketInsights;