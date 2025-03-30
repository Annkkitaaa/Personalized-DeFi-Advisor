// frontend/src/components/strategy/RiskFactors.jsx
import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const RiskFactors = ({ risks }) => {
  if (!risks || risks.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No risk factors available from the API. Try regenerating the strategy.
      </div>
    );
  }

  // Filter out any invalid risk entries
  const validRisks = risks.filter(risk => typeof risk === 'string' && risk.trim().length > 0);

  if (validRisks.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No valid risk factors available from the API. Try regenerating the strategy.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {validRisks.map((risk, index) => (
        <li key={index} className="flex items-start">
          <FaExclamationCircle className="text-cyber-pink mt-1 mr-2 flex-shrink-0" />
          <span className="text-gray-300">{risk}</span>
        </li>
      ))}
    </ul>
  );
};

export default RiskFactors;