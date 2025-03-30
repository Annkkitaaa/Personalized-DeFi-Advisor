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
    if (assetLower.includes('stable') || assetLower.includes('usdc') || assetLower.includes('dai')) {
      return 'bg-cyber-blue';
    } else if (assetLower.includes('eth') || assetLower.includes('staking')) {
      return 'bg-cyber-yellow';
    } else if (assetLower.includes('alt') || assetLower.includes('liquidity')) {
      return 'bg-cyber-pink';
    }
    return 'bg-cyber-purple';
  };

  // Normalize percentage value for progress bar width
  const getNormalizedPercentage = (value) => {
    // Check if the value is already a number
    if (typeof value === 'number') {
      return `${value}%`;
    }
    
    // Convert percentage string to number
    if (typeof value === 'string') {
      // Handle ranges like "40-60%"
      if (value.includes('-')) {
        const [min, max] = value.replace(/%/g, '').split('-').map(v => parseInt(v.trim()));
        return `${(min + max) / 2}%`;
      }
      
      // Extract number from string (handles "25%" or "25")
      const match = value.match(/(\d+)/);
      if (match) {
        return `${match[1]}%`;
      }
    }
    
    // Fallback for when we can't determine percentage
    return '0%';
  };
  
  // Format display value to ensure consistent presentation
  const formatDisplayValue = (value) => {
    if (typeof value === 'number') {
      return `${value}%`;
    }
    
    if (typeof value === 'string') {
      // Already has a % sign
      if (value.includes('%')) {
        return value;
      }
      // Is a range like "4-6"
      if (value.includes('-')) {
        return `${value}%`;
      }
      // Try to parse as a number
      const match = value.match(/(\d+)/);
      if (match) {
        return `${match[1]}%`;
      }
    }
    
    return value;
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        {Object.entries(allocation).map(([asset, percentage]) => (
          <div key={asset} className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-white capitalize">{asset}</span>
              <span className="text-cyber-blue">{formatDisplayValue(percentage)}</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${getAssetColor(asset)}`}
                style={{ width: getNormalizedPercentage(percentage) }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetAllocationSection;