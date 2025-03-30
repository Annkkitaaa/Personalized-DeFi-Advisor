import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AssetAllocation = ({ allocation }) => {
  if (!allocation || Object.keys(allocation).length === 0) {
    allocation = {
      'Stablecoins': '50%',
      'Ethereum': '30%',
      'Altcoins': '20%'
    };
  }

  // Convert percentage strings to numbers
  const processedAllocation = {};
  Object.entries(allocation).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Handle ranges like "40-60%"
      if (value.includes('-')) {
        const [min, max] = value.replace('%', '').split('-').map(Number);
        processedAllocation[key] = (min + max) / 2;
      } else {
        processedAllocation[key] = parseFloat(value.replace('%', ''));
      }
    } else {
      processedAllocation[key] = value;
    }
  });

  const data = {
    labels: Object.keys(processedAllocation),
    datasets: [
      {
        data: Object.values(processedAllocation),
        backgroundColor: [
          '#2de2e6', // cyber-blue
          '#f6f740', // cyber-yellow
          '#ff3864', // cyber-pink
          '#541388', // cyber-purple
          '#0d0221', // cyber-black
        ],
        borderColor: '#13111C',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="card">
      <h2 className="text-xl font-cyber mb-4">Asset Allocation</h2>
      <div style={{ height: '280px' }}>
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(allocation).map(([asset, percentage], index) => (
          <div key={index} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ 
              backgroundColor: data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]
            }}></div>
            <div className="flex-1 flex justify-between">
              <span className="text-sm">{asset}</span>
              <span className="text-sm text-cyber-blue">{percentage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetAllocation;