// frontend/src/components/strategy/ProtocolsSection.jsx
import React from 'react';
import { FaEthereum } from 'react-icons/fa';

const ProtocolsSection = ({ protocols, steps }) => {
  // Check if we have real data
  if ((!protocols || protocols.length === 0) && (!steps || steps.length === 0)) {
    return (
      <div className="p-4 text-center text-gray-400">
        No protocol data available from the API. Try regenerating the strategy.
      </div>
    );
  }

  // Clean protocol names by removing special characters
  const cleanProtocolList = Array.isArray(protocols) 
    ? protocols.map(p => typeof p === 'string' ? p.replace(/[\*"]/g, '').trim() : '')
      .filter(p => p.length > 0)
    : [];
  
  // Extract implementation steps related to protocols
  const protocolSteps = Array.isArray(steps) 
    ? steps.filter(step => typeof step === 'string' && step.length > 0)
    : [];

  // Get the appropriate icon for each protocol
  const getProtocolIcon = (protocol) => {
    const lowerProtocol = protocol.toLowerCase();
    if (lowerProtocol.includes('aave')) {
      return <div className="text-lg font-bold text-cyber-blue">Aa</div>;
    } else if (lowerProtocol.includes('compound')) {
      return <div className="text-lg font-bold text-cyber-blue">Co</div>;
    } else if (lowerProtocol.includes('uniswap')) {
      return <div className="text-lg font-bold text-cyber-pink">🦄</div>;
    } else if (lowerProtocol.includes('curve')) {
      return <div className="text-lg font-bold text-cyber-yellow">Cv</div>;
    } else if (lowerProtocol.includes('eth') || lowerProtocol.includes('staking')) {
      return <FaEthereum className="text-cyber-blue" />;
    }
    return <FaEthereum className="text-cyber-blue" />;
  };

  return (
    <div className="w-full">
      {/* Protocol list */}
      {cleanProtocolList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {cleanProtocolList.map((protocol, index) => (
            <div 
              key={index}
              className="glass-panel p-4 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-card-bg border border-cyber-purple flex items-center justify-center mb-2">
                {getProtocolIcon(protocol)}
              </div>
              <span className="text-sm">{protocol}</span>
            </div>
          ))}
        </div>
      )}

      {/* Protocol steps */}
      {protocolSteps.length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="font-cyber text-md mb-4">Implementation Strategy</h3>
          <div className="space-y-3">
            {protocolSteps.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyber-purple flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs">{index + 1}</span>
                </div>
                <p className="text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolsSection;