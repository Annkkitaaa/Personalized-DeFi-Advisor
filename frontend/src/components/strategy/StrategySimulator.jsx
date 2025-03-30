// frontend/src/components/strategy/StrategySimulator.jsx
import React, { useState } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { FaPlay, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';

const StrategySimulator = ({ marketData }) => {
  const { profile } = useUserProfile();
  const [timeframe, setTimeframe] = useState(profile.timeHorizon || 12);
  const [allocation, setAllocation] = useState({
    stablecoins: 50,
    ethereum: 30,
    altcoins: 20
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleAllocationChange = (asset, value) => {
    const newValue = parseInt(value);
    if (isNaN(newValue)) return;

    // Update this asset while adjusting others proportionally
    const currentTotal = Object.values(allocation).reduce((a, b) => a + b, 0);
    const difference = newValue - allocation[asset];
    
    const newAllocation = { ...allocation, [asset]: newValue };
    
    // If we're increasing this asset, decrease others proportionally
    if (difference > 0) {
      const otherAssets = Object.keys(allocation).filter(a => a !== asset);
      const totalOthers = otherAssets.reduce((sum, a) => sum + allocation[a], 0);
      
      otherAssets.forEach(otherAsset => {
        const proportion = allocation[otherAsset] / totalOthers;
        newAllocation[otherAsset] = Math.max(0, allocation[otherAsset] - (difference * proportion));
      });
    } 
    // If we're decreasing this asset, increase others proportionally
    else if (difference < 0) {
      const otherAssets = Object.keys(allocation).filter(a => a !== asset);
      const totalOthers = otherAssets.reduce((sum, a) => sum + allocation[a], 0);
      
      otherAssets.forEach(otherAsset => {
        const proportion = allocation[otherAsset] / totalOthers;
        newAllocation[otherAsset] = allocation[otherAsset] + (Math.abs(difference) * proportion);
      });
    }
    
    // Round values and ensure they sum to 100
    Object.keys(newAllocation).forEach(a => {
      newAllocation[a] = Math.round(newAllocation[a]);
    });
    
    // Adjust to ensure total is 100%
    const newTotal = Object.values(newAllocation).reduce((a, b) => a + b, 0);
    if (newTotal !== 100) {
      const largestAsset = Object.keys(newAllocation).reduce(
        (a, b) => newAllocation[a] > newAllocation[b] ? a : b
      );
      newAllocation[largestAsset] += (100 - newTotal);
    }
    
    setAllocation(newAllocation);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    
    // In a real implementation, this would make API calls
    // For now, we'll use realistic market projections based on historical averages
    setTimeout(() => {
      // Base expected returns for each asset class
      const baseReturns = {
        stablecoins: marketData.marketTrend === 'bearish' ? 4.5 : 3.8,
        ethereum: marketData.marketTrend === 'bullish' ? 25 : 
                 marketData.marketTrend === 'bearish' ? -10 : 15,
        altcoins: marketData.marketTrend === 'bullish' ? 40 : 
                marketData.marketTrend === 'bearish' ? -20 : 20
      };
      
      // Calculate weighted return
      const expectedReturn = Object.keys(allocation).reduce((total, asset) => {
        return total + (allocation[asset] / 100) * baseReturns[asset];
      }, 0);
      
      // Calculate portfolio value after timeframe
      const initialInvestment = profile.capital || 10000;
      const finalValue = initialInvestment * (1 + (expectedReturn / 100) * (timeframe / 12));
      
      // Calculate risk score (1-10)
      const riskScore = (allocation.ethereum * 0.05) + (allocation.altcoins * 0.1) + 1;
      
      setSimulationResult({
        expectedReturn: expectedReturn.toFixed(2),
        finalValue: finalValue.toFixed(2),
        profit: (finalValue - initialInvestment).toFixed(2),
        riskScore: riskScore.toFixed(1),
        timeframe
      });
      
      setIsSimulating(false);
    }, 1500); // Simulate API delay
  };

  return (
    <div className="card">
      <h2 className="text-xl font-cyber mb-4 flex items-center">
        <FaChartLine className="text-cyber-blue mr-2" />
        <span>Strategy Simulator</span>
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-cyber mb-2">Investment Timeframe (months)</label>
        <input
          type="range"
          min="1"
          max="60"
          value={timeframe}
          onChange={(e) => setTimeframe(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 month</span>
          <span>{timeframe} months</span>
          <span>5 years</span>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-cyber mb-2">Asset Allocation</label>
        
        {Object.keys(allocation).map(asset => (
          <div key={asset} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="capitalize">{asset}</span>
              <span className="text-cyber-blue">{allocation[asset]}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation[asset]}
              onChange={(e) => handleAllocationChange(asset, e.target.value)}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                asset === 'stablecoins' ? 'bg-cyber-blue' :
                asset === 'ethereum' ? 'bg-cyber-yellow' :
                'bg-cyber-pink'
              }`}
            />
          </div>
        ))}
      </div>
      
      <button
        onClick={runSimulation}
        disabled={isSimulating}
        className="cyber-button w-full flex items-center justify-center"
      >
        {isSimulating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>Simulating...</span>
          </>
        ) : (
          <>
            <FaPlay className="mr-2" />
            <span>Run Simulation</span>
          </>
        )}
      </button>
      
      {simulationResult && (
        <div className="mt-6 glass-panel p-4">
          <h3 className="font-cyber text-lg mb-4 text-center">Simulation Results</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-xs">Expected Return</div>
              <div className={`text-lg font-bold ${
                parseFloat(simulationResult.expectedReturn) > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {simulationResult.expectedReturn}%
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 text-xs">Risk Score</div>
              <div className={`text-lg font-bold ${
                parseFloat(simulationResult.riskScore) < 4 ? 'text-cyber-blue' :
                parseFloat(simulationResult.riskScore) < 7 ? 'text-cyber-yellow' :
                'text-cyber-pink'
              }`}>
                {simulationResult.riskScore}/10
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 text-xs">Initial Investment</div>
              <div className="text-lg font-bold text-white">
                ${profile.capital?.toLocaleString() || '10,000'}
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 text-xs">Projected Value</div>
              <div className="text-lg font-bold text-cyber-blue">
                ${parseFloat(simulationResult.finalValue).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white border-opacity-10">
            <div className="flex items-center justify-between">
              <div className="text-sm">Projected Profit/Loss:</div>
              <div className={`text-lg font-bold ${
                parseFloat(simulationResult.profit) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {parseFloat(simulationResult.profit) >= 0 ? '+' : ''}${parseFloat(simulationResult.profit).toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Over {simulationResult.timeframe} month{simulationResult.timeframe !== 1 ? 's' : ''}
              {' '}with current market trend: {marketData.marketTrend || 'neutral'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategySimulator;