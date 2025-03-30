// frontend/src/components/strategy/ExpectedReturns.jsx
import React from 'react';

const ExpectedReturns = ({ expectedReturns }) => {
  // Only use real data from the API response
  if (!expectedReturns || expectedReturns.min === null || expectedReturns.max === null) {
    return (
      <div className="p-4 text-center text-gray-400">
        No expected returns data available from the API. Try regenerating the strategy.
      </div>
    );
  }

  // Calculate bar width based on average return (capped at 100%)
  const averageReturn = (expectedReturns.min + expectedReturns.max) / 2;
  const barWidth = `${Math.min(100, averageReturn * 4)}%`; // Scale for visual appeal

  return (
    <div className="flex flex-col items-center">
      <div className="text-5xl font-bold text-cyber-yellow mb-2">
        {expectedReturns.min}% - {expectedReturns.max}%
      </div>
      <div className="text-gray-400 mb-4">
        {expectedReturns.timeframe || '12 months'}
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full mb-2">
        <div 
          className="bg-gradient-to-r from-cyber-blue via-cyber-yellow to-cyber-pink h-full rounded-full"
          style={{ width: barWidth }}
        ></div>
      </div>
    </div>
  );
};

export default ExpectedReturns;