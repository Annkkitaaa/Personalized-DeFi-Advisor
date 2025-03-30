// frontend/src/components/strategy/ProtocolsSection.jsx
import React from 'react';

const ProtocolsSection = ({ protocols, steps }) => {
  // Check if we have real data
  if ((!protocols || protocols.length === 0) && (!steps || steps.length === 0)) {
    return (
      <div className="p-4 text-center text-gray-400">
        No protocol data available from the API. Try regenerating the strategy.
      </div>
    );
  }

  // Get protocol icon
  const getProtocolIcon = (name) => {
    if (!name) return null;
    
    const lcName = name.toLowerCase();
    if (lcName.includes('aave')) return <div className="text-4xl">Aa</div>;
    if (lcName.includes('uniswap')) return <div className="text-4xl">🦄</div>;
    if (lcName.includes('curve')) return <div className="text-2xl font-bold">Cv</div>;
    if (lcName.includes('compound')) return <div className="text-2xl font-bold">Co</div>;
    if (lcName.includes('staking') || lcName.includes('eth')) return <div className="text-2xl">Ξ</div>;
    return <div className="text-2xl font-bold">⟠</div>;
  };

  // Group protocols and related implementation steps
  const getGroupedProtocols = () => {
    const protocolGroups = [];
    
    // Extract protocol names and details
    if (protocols && protocols.length > 0) {
      protocols.forEach(protocol => {
        if (typeof protocol === 'string' && protocol.trim()) {
          // Handle numbered protocol list (like "1.Uniswap Liquidity")
          let name = protocol.trim();
          let description = '';
          
          // Check if protocol has numbering (1. Protocol Name)
          const numberMatch = name.match(/^(\d+)\.?(.*)/);
          if (numberMatch) {
            name = numberMatch[2].trim();
          }
          
          // Add protocol
          protocolGroups.push({
            name,
            description,
            steps: []
          });
        }
      });
    }
    
    // Match implementation steps with protocols
    if (steps && steps.length > 0) {
      steps.forEach(step => {
        if (typeof step === 'string' && step.trim()) {
          let stepText = step.trim();
          
          // Find matching protocol for this step
          for (const protocol of protocolGroups) {
            if (stepText.toLowerCase().includes(protocol.name.toLowerCase())) {
              protocol.steps.push(stepText);
              return;
            }
          }
          
          // If no match found, add to general implementation steps
          const generalImplementation = protocolGroups.find(p => 
            p.name.toLowerCase().includes('implementation') || 
            p.name.toLowerCase().includes('instruction')
          );
          
          if (generalImplementation) {
            generalImplementation.steps.push(stepText);
          } else {
            // Create a new protocol group for implementation steps
            protocolGroups.push({
              name: 'Implementation Instructions',
              description: '',
              steps: [stepText]
            });
          }
        }
      });
    }
    
    return protocolGroups;
  };

  const protocolGroups = getGroupedProtocols();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {protocolGroups.map((protocol, index) => (
        <div key={index} className="glass-panel p-4 flex flex-col h-full">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 rounded-full bg-card-bg border border-cyber-purple flex items-center justify-center mr-3">
              {getProtocolIcon(protocol.name)}
            </div>
            <h3 className="font-cyber text-lg">{protocol.name}</h3>
          </div>
          
          {protocol.description && (
            <p className="text-gray-300 mb-3 text-sm">{protocol.description}</p>
          )}
          
          {protocol.steps.length > 0 && (
            <div className="mt-auto">
              <div className="space-y-2">
                {protocol.steps.map((step, stepIdx) => (
                  <div key={stepIdx} className="text-sm text-gray-300">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProtocolsSection;