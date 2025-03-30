// frontend/src/components/dashboard/ProtocolAlerts.jsx
import React from 'react';
import { FaBell, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const ProtocolAlerts = ({ protocolData }) => {
  // Generate relevant alerts based on protocol data
  const generateAlerts = () => {
    const alerts = [];
    
    // Check for high APYs that might be too good to be true
    if (protocolData) {
      // Check Uniswap pools
      if (Array.isArray(protocolData.uniswap)) {
        protocolData.uniswap.forEach(pool => {
          if (pool && pool.estimatedAPY && pool.estimatedAPY > 20) {
            alerts.push({
              type: 'warning',
              title: `High APY on ${pool.name}`,
              message: `${pool.name} has an unusually high APY of ${pool.estimatedAPY.toFixed(2)}%. Verify before investing.`,
              protocol: 'Uniswap'
            });
          }
        });
      }
      
      // Check if there are significant differences between lending rates
      if (protocolData.aave && protocolData.compound) {
        for (const token of ['DAI', 'USDC', 'ETH']) {
          if (protocolData.aave[token] && protocolData.compound[token]) {
            const aaveRate = protocolData.aave[token].supplyAPY;
            const compoundRate = protocolData.compound[token].supplyAPY;
            
            if (aaveRate && compoundRate) {
              const diff = Math.abs(aaveRate - compoundRate);
              if (diff > 1) {
                const higher = aaveRate > compoundRate ? 'Aave' : 'Compound';
                alerts.push({
                  type: 'info',
                  title: `${token} Rate Difference`,
                  message: `${higher} offers ${diff.toFixed(1)}% higher ${token} supply rate than ${higher === 'Aave' ? 'Compound' : 'Aave'}.`,
                  protocol: higher
                });
              }
            }
          }
        }
      }
    }
    
    // Add general market trend alert
    if (protocolData && protocolData.ethPrice) {
      const ethPrice = protocolData.ethPrice;
      
      if (ethPrice < 1500) {
        alerts.push({
          type: 'warning',
          title: 'ETH Price Alert',
          message: `ETH price is below $1,500 (currently $${ethPrice.toFixed(2)}). Consider your entry strategy carefully.`,
          protocol: 'Market'
        });
      } else if (ethPrice > 2500) {
        alerts.push({
          type: 'info',
          title: 'ETH Price Alert',
          message: `ETH price is above $2,500 (currently $${ethPrice.toFixed(2)}). Consider taking some profits if overexposed.`,
          protocol: 'Market'
        });
      }
    }
    
    return alerts;
  };
  
  const alerts = generateAlerts();
  
  if (alerts.length === 0) {
    return null;
  }
  
  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <FaBell className="text-cyber-blue mr-2" />
        <h2 className="text-xl font-cyber">Protocol Alerts</h2>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className={`border ${
              alert.type === 'warning' ? 'border-cyber-pink bg-cyber-pink' : 'border-cyber-blue bg-cyber-blue'
            } bg-opacity-10 border-opacity-50 rounded-md p-3`}
          >
            <div className="flex items-start">
              <div className="mt-1 mr-2">
                {alert.type === 'warning' ? (
                  <FaExclamationTriangle className="text-cyber-pink" />
                ) : (
                  <FaInfoCircle className="text-cyber-blue" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{alert.title}</h3>
                <p className="text-sm text-gray-300">{alert.message}</p>
                <div className="text-xs text-gray-400 mt-1">Protocol: {alert.protocol}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProtocolAlerts;