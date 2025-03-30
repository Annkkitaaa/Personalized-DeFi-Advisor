// frontend/src/components/strategy/SmartContractSimulation.jsx
import React, { useState, useEffect } from 'react';
import { FaRobot, FaExchangeAlt, FaPiggyBank, FaChartLine } from 'react-icons/fa';
import { useWallet } from '../../contexts/WalletContext';
import { simulateOperation } from '../../services/api';

const SmartContractSimulation = ({ ethPrice, gasPrice }) => {
  const { address } = useWallet();
  const [simulationType, setSimulationType] = useState(null);
  const [simulationParams, setSimulationParams] = useState({
    aaveDeposit: {
      assetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      amount: '1000000000', // 1000 USDC (6 decimals)
      interestRateMode: 1
    },
    uniswapSwap: {
      tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      fee: 3000,
      amountIn: '1000000000' // 1000 USDC (6 decimals)
    }
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Update simulation parameters based on real ETH price
  useEffect(() => {
    if (ethPrice && ethPrice > 0) {
      console.log(`Updating simulation parameters based on ETH price: $${ethPrice}`);
      // No need to directly modify the simulation parameters based on ETH price,
      // but we could adjust amounts if needed in a real application
    }
  }, [ethPrice]);

  const handleSimulate = async (type) => {
    if (!address) {
      setError('Please connect your wallet first to run simulations');
      return;
    }

    setSimulationType(type);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await simulateOperation(type, simulationParams[type]);
      
      if (!response || !response.data) {
        throw new Error('Simulation returned invalid data');
      }
      
      setResult(response.data);
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to run simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate gas cost in USD
  const calculateGasCost = (gasUnits) => {
    if (!gasPrice || !ethPrice) return 'N/A';
    
    const gasUnitsNumber = gasUnits || 200000; // Default gas units for complex transactions
    const gasPriceGwei = parseFloat(gasPrice);
    const gasCostEth = (gasUnitsNumber * gasPriceGwei) / 1e9;
    const gasCostUsd = gasCostEth * ethPrice;
    
    return `$${gasCostUsd.toFixed(2)}`;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-gray-300">
          Simulate interactions with DeFi protocols without executing transactions on-chain.
          This allows you to estimate returns and understand impacts before committing funds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div 
          className="glass-panel p-4 hover:border-cyber-blue transition-colors cursor-pointer flex flex-col items-center"
          onClick={() => handleSimulate('aaveDeposit')}
        >
          <FaPiggyBank className="text-cyber-blue text-2xl mb-2" />
          <h3 className="font-cyber text-lg mb-1">Simulate Aave Deposit</h3>
          <p className="text-xs text-gray-400 text-center">
            Calculate potential yields from depositing 1000 USDC to Aave
          </p>
          {ethPrice && gasPrice && (
            <div className="mt-2 text-xs text-gray-500">
              Est. gas cost: {calculateGasCost(250000)}
            </div>
          )}
        </div>

        <div 
          className="glass-panel p-4 hover:border-cyber-blue transition-colors cursor-pointer flex flex-col items-center"
          onClick={() => handleSimulate('uniswapSwap')}
        >
          <FaExchangeAlt className="text-cyber-pink text-2xl mb-2" />
          <h3 className="font-cyber text-lg mb-1">Simulate Uniswap Swap</h3>
          <p className="text-xs text-gray-400 text-center">
            Check exchange rates for swapping 1000 USDC to ETH
          </p>
          {ethPrice && gasPrice && (
            <div className="mt-2 text-xs text-gray-500">
              Est. gas cost: {calculateGasCost(180000)}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-panel p-4 text-center">
          <div className="inline-block w-6 h-6 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Simulating {simulationType === 'aaveDeposit' ? 'Aave Deposit' : 'Uniswap Swap'}...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-panel p-4 border-cyber-pink text-center">
          <p className="text-cyber-pink mb-2">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-xs border border-cyber-pink px-2 py-1 rounded hover:bg-cyber-pink hover:bg-opacity-20 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Result state - Aave Deposit */}
      {result && simulationType === 'aaveDeposit' && (
        <div className="glass-panel p-4">
          <h3 className="font-cyber text-lg mb-3 text-center">Aave Deposit Simulation</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-400">Token</p>
              <p className="font-bold">{result.token || 'USDC'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Deposit Amount</p>
              <p className="font-bold">{result.amountFormatted || '1000'} {result.token || 'USDC'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-400">Expected APY</p>
              <p className="font-bold text-cyber-blue">{result.apy?.toFixed(2) || '3.10'}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Annual Interest</p>
              <p className="font-bold text-cyber-yellow">
                {result.expectedAnnualInterestFormatted || '31'} {result.token || 'USDC'}
              </p>
            </div>
          </div>
          
          <div className="border-t border-white border-opacity-10 pt-3 mt-3">
            <p className="text-xs text-gray-400 text-center">
              Current gas cost for this transaction: {calculateGasCost(result.gasEstimate || 250000)}
            </p>
          </div>
        </div>
      )}

      {/* Result state - Uniswap Swap */}
      {result && simulationType === 'uniswapSwap' && (
        <div className="glass-panel p-4">
          <h3 className="font-cyber text-lg mb-3 text-center">Uniswap Swap Simulation</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-400">From</p>
              <p className="font-bold">
                {result.amountInFormatted || '1000'} {result.tokenIn || 'USDC'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">To</p>
              <p className="font-bold">
                {result.amountOutFormatted || 
                 (ethPrice ? (1000 / ethPrice).toFixed(6) : '0.55')} {result.tokenOut || 'ETH'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-400">Exchange Rate</p>
              <p className="font-bold">1 {result.tokenOut || 'ETH'} = ${ethPrice?.toFixed(2) || 
                result.exchangeRate ? (1000 / parseFloat(result.amountOutFormatted)).toFixed(2) : '1800'} {result.tokenIn || 'USDC'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Slippage</p>
              <p className="font-bold">{result.slippage || '0.5'}%</p>
            </div>
          </div>
          
          <div className="border-t border-white border-opacity-10 pt-3 mt-3">
            <p className="text-xs text-gray-400 text-center">
              Current gas cost for this transaction: {calculateGasCost(result.gasEstimate || 180000)}
            </p>
          </div>
        </div>
      )}

      <div className="text-xs text-center text-gray-400 mt-2">
        Simulations use real-time on-chain data but don't execute actual transactions
      </div>
    </div>
  );
};

export default SmartContractSimulation;