// frontend/src/components/strategy/ImplementationSteps.jsx
import React from 'react';

const ImplementationSteps = ({ steps }) => {
  // Only use real data from the API response
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No implementation steps available from the API. Try regenerating the strategy.
      </div>
    );
  }

  // Filter out any invalid steps
  const validSteps = steps.filter(step => typeof step === 'string' && step.trim().length > 0);

  if (validSteps.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No valid implementation steps available from the API. Try regenerating the strategy.
      </div>
    );
  }

  return (
    <ol className="space-y-4">
      {validSteps.map((step, index) => (
        <li key={index} className="flex">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-purple flex items-center justify-center mr-3">
            <span className="text-white font-bold">{index + 1}</span>
          </div>
          <div className="pt-1">
            <p className="text-gray-300">{step}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default ImplementationSteps;