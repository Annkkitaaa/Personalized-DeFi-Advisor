import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useUserProfile } from '../../contexts/UserProfileContext';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioChart = ({ marketData }) => {
  const { riskProfile } = useUserProfile();

  // Get allocation percentages based on risk profile and market trend
  const getAllocation = () => {
    const marketTrend = marketData?.marketTrend || 'neutral';
    
    if (riskProfile === 'conservative') {
      if (marketTrend === 'bearish') {
        return {
          stablecoins: 80,
          ethereum: 15,
          altcoins: 5
        };
      } else {
        return {
          stablecoins: 70,
          ethereum: 20,
          altcoins: 10
        };
      }
    } else if (riskProfile === 'aggressive') {
      if (marketTrend === 'bearish') {
        return {
          stablecoins: 30,
          ethereum: 40,
          altcoins: 30
        };
      } else {
        return {
          stablecoins: 20,
          ethereum: 45,
          altcoins: 35
        };
      }
    } else { // moderate
      if (marketTrend === 'bearish') {
        return {
          stablecoins: 60,
          ethereum: 30,
          altcoins: 10
        };
      } else {
        return {
          stablecoins: 40,
          ethereum: 40,
          altcoins: 20
        };
      }
    }
  };

  const allocation = getAllocation();

  const data = {
    labels: ['Stablecoins', 'Ethereum', 'Altcoins'],
    datasets: [
      {
        data: [allocation.stablecoins, allocation.ethereum, allocation.altcoins],
        backgroundColor: [
          '#2de2e6', // cyber-blue for stablecoins
          '#f6f740', // cyber-yellow for ethereum
          '#ff3864', // cyber-pink for altcoins
        ],
        borderColor: [
          '#2de2e699',
          '#f6f74099',
          '#ff386499',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            family: 'Chakra Petch'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1A1A2E',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#2de2e6',
        borderWidth: 1,
        padding: 10,
        titleFont: {
          family: 'Orbitron'
        },
        bodyFont: {
          family: 'Chakra Petch'
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    cutout: '60%',
  };

  return (
    <div className="card">
      <h2 className="text-xl font-cyber mb-4">Recommended Allocation</h2>
      <div className="relative" style={{ height: '280px' }}>
        <Pie data={data} options={options} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className={`text-sm ${
            riskProfile === 'conservative' ? 'text-cyber-blue' : 
            riskProfile === 'aggressive' ? 'text-cyber-pink' : 
            'text-cyber-yellow'
          }`}>
            {riskProfile}
          </div>
          <div className="text-xs text-gray-400">profile</div>
        </div>
      </div>
      <div className="mt-3 border-t border-white border-opacity-10 pt-3">
        <div className="text-xs text-gray-400 text-center">
          Based on your risk profile and current market conditions
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;