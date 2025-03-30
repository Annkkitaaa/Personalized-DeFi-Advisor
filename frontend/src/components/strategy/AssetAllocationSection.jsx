// frontend/src/components/strategy/AssetAllocationSection.jsx
import React from 'react';

const AssetAllocationSection = ({ allocation }) => {
  // Only use the real data from the API response
  if (!allocation || Object.keys(allocation).length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No allocation data available from the API. Try regenerating the strategy.
      </div>
    );
  }

  // Get color based on asset type
  const getAssetColor = (asset) => {
    const assetLower = asset.toLowerCase();
    if (assetLower.includes('stable') || assetLower.includes('usdc') || assetLower.includes('dai') || assetLower.includes('usdt')) {
      return 'from-cyan-500 to-cyan-400';
    } else if (assetLower.includes('eth') || assetLower.includes('ethereum')) {
      return 'from-yellow-500 to-yellow-400';
    } else if (assetLower.includes('alt') || assetLower.includes('btc') || assetLower.includes('bitcoin')) {
      return 'from-pink-500 to-pink-400';
    }
    return 'from-purple-500 to-purple-400';
  };

  // Normalize percentage value for progress bar width
  const getNormalizedPercentage = (value) => {
    if (typeof value === 'string') {
      // Handle ranges like "30-40%"
      if (value.includes('-')) {
        const [min, max] = value.replace(/%/g, '').split('-').map(v => parseInt(v.trim()));
        return (min + max) / 2;
      }
      // Handle percentages like "30%"
      const match = value.match(/(\d+)/);
      return match ? parseInt(match[1]) : 50;
    }
    if (typeof value === 'number') {
      return value;
    }
    return 50; // Default value if parsing fails
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        {Object.entries(allocation).map(([asset, percentage]) => (
          <div key={asset} className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-white capitalize">{asset}</span>
              <span className="text-cyber-blue">{percentage}</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${getAssetColor(asset)}`}
                style={{ width: `${getNormalizedPercentage(percentage)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetAllocationSection;