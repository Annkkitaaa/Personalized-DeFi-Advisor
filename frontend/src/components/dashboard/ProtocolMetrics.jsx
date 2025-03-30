// frontend/src/components/dashboard/ProtocolMetrics.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaEthereum, FaCubes, FaExchangeAlt, FaPercentage } from 'react-icons/fa';

const ProtocolMetrics = ({ protocolData }) => {
  if (!protocolData) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-cyber-purple bg-opacity-30 rounded mb-4"></div>
        <div className="h-32 bg-cyber-purple bg-opacity-20 rounded"></div>
      </div>
    );
  }

  // Calculate top supply and borrow rates
  const getTopSupplyRate = () => {
    let maxRate = 0;
    let topProtocol = '';
    let topToken = '';

    // Check Aave rates
    if (protocolData.aave) {
      Object.entries(protocolData.aave).forEach(([token, data]) => {
        if (data && data.supplyAPY && data.supplyAPY > maxRate) {
          maxRate = data.supplyAPY;
          topProtocol = 'Aave';
          topToken = token;
        }
      });
    }

    // Check Compound rates
    if (protocolData.compound) {
      Object.entries(protocolData.compound).forEach(([token, data]) => {
        if (data && data.supplyAPY && data.supplyAPY > maxRate) {
          maxRate = data.supplyAPY;
          topProtocol = 'Compound';
          topToken = token;
        }
      });
    }

    return {
      rate: maxRate.toFixed(2),
      protocol: topProtocol,
      token: topToken
    };
  };

  const getTopBorrowRate = () => {
    let minRate = Infinity;
    let topProtocol = '';
    let topToken = '';

    // Check Aave rates
    if (protocolData.aave) {
      Object.entries(protocolData.aave).forEach(([token, data]) => {
        if (data && data.borrowAPY && data.borrowAPY < minRate) {
          minRate = data.borrowAPY;
          topProtocol = 'Aave';
          topToken = token;
        }
      });
    }

    // Check Compound rates
    if (protocolData.compound) {
      Object.entries(protocolData.compound).forEach(([token, data]) => {
        if (data && data.borrowAPY && data.borrowAPY < minRate) {
          minRate = data.borrowAPY;
          topProtocol = 'Compound';
          topToken = token;
        }
      });
    }

    return {
      rate: minRate === Infinity ? '0.00' : minRate.toFixed(2),
      protocol: topProtocol,
      token: topToken
    };
  };

  const getTopLiquidityPool = () => {
    let maxAPY = 0;
    let topProtocol = '';
    let poolName = '';

    // Check Uniswap pools
    if (Array.isArray(protocolData.uniswap)) {
      protocolData.uniswap.forEach(pool => {
        if (pool && pool.estimatedAPY && pool.estimatedAPY > maxAPY) {
          maxAPY = pool.estimatedAPY;
          topProtocol = 'Uniswap';
          poolName = pool.name;
        }
      });
    }

    // Check Curve pools
    if (Array.isArray(protocolData.curve)) {
      protocolData.curve.forEach(pool => {
        if (pool && pool.apy && pool.apy > maxAPY) {
          maxAPY = pool.apy;
          topProtocol = 'Curve';
          poolName = pool.name;
        }
      });
    }

    return {
      apy: maxAPY.toFixed(2),
      protocol: topProtocol,
      pool: poolName
    };
  };

  const topSupply = getTopSupplyRate();
  const topBorrow = getTopBorrowRate();
  const topLiquidity = getTopLiquidityPool();

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-xl font-cyber mb-4">Protocol Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <div className="flex items-center text-cyber-blue mb-2">
            <FaPercentage className="mr-2" />
            <h3 className="font-cyber">Best Supply Rate</h3>
          </div>
          <div className="text-xl font-bold text-cyber-yellow">{topSupply.rate}% APY</div>
          <div className="text-sm text-gray-400">
            {topSupply.protocol} {topSupply.token}
          </div>
        </div>
        
        <div className="glass-panel p-4">
          <div className="flex items-center text-cyber-blue mb-2">
            <FaExchangeAlt className="mr-2" />
            <h3 className="font-cyber">Best Borrow Rate</h3>
          </div>
          <div className="text-xl font-bold text-cyber-yellow">{topBorrow.rate}% APY</div>
          <div className="text-sm text-gray-400">
            {topBorrow.protocol} {topBorrow.token}
          </div>
        </div>
        
        <div className="glass-panel p-4">
          <div className="flex items-center text-cyber-blue mb-2">
            <FaCubes className="mr-2" />
            <h3 className="font-cyber">Best Liquidity Pool</h3>
          </div>
          <div className="text-xl font-bold text-cyber-yellow">{topLiquidity.apy}% APY</div>
          <div className="text-sm text-gray-400">
            {topLiquidity.protocol} {topLiquidity.pool}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-center text-gray-400">
        Data refreshed at {new Date().toLocaleTimeString()}
      </div>
    </motion.div>
  );
};

export default ProtocolMetrics;