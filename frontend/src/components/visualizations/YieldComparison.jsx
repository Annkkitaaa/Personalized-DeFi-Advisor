import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const YieldComparison = ({ protocolData }) => {
  // Default data if real data isn't available
  const defaultData = {
    'Aave USDC': 2.8,
    'Compound DAI': 2.5,
    'Curve 3Pool': 3.1,
    'Uniswap ETH-USDC': 12.5,
    'Aave ETH': 0.5,
    'Compound USDC': 2.7
  };

  // Process real protocol data if available
  let processedData = {};
  
  if (protocolData) {
    try {
      if (protocolData.aave) {
        Object.entries(protocolData.aave).forEach(([token, data]) => {
          if (data.supplyAPY) {
            processedData[`Aave ${token}`] = parseFloat(data.supplyAPY);
          }
        });
      }
      
      if (protocolData.compound) {
        Object.entries(protocolData.compound).forEach(([token, data]) => {
          if (data.supplyAPY) {
            processedData[`Compound ${token}`] = parseFloat(data.supplyAPY);
          }
        });
      }
      
      if (protocolData.curve && protocolData.curve.length > 0) {
        protocolData.curve.slice(0, 2).forEach(pool => {
          processedData[`Curve ${pool.name}`] = parseFloat(pool.apy);
        });
      }
      
      if (protocolData.uniswap && protocolData.uniswap.length > 0) {
        protocolData.uniswap.slice(0, 2).forEach(pool => {
          processedData[`Uniswap ${pool.name}`] = parseFloat(pool.estimatedAPY);
        });
      }
    } catch (e) {
      console.error('Error processing protocol data:', e);
      processedData = defaultData;
    }
  }
  
  // Use processed data if available, otherwise use default
  const yieldData = Object.keys(processedData).length > 0 ? processedData : defaultData;
  
  // Sort by APY
  const sortedLabels = Object.keys(yieldData).sort((a, b) => yieldData[b] - yieldData[a]);
  const sortedValues = sortedLabels.map(label => yieldData[label]);
  
  // Color coding by protocol
  const backgroundColors = sortedLabels.map(label => {
    if (label.includes('Aave')) return '#2de2e6';
    if (label.includes('Compound')) return '#541388';
    if (label.includes('Curve')) return '#f6f740';
    if (label.includes('Uniswap')) return '#ff3864';
    return '#2663FF';
  });

  const data = {
    labels: sortedLabels,
    datasets: [
      {
        label: 'APY %',
        data: sortedValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => `${color}99`),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
            return `APY: ${context.raw.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#ffffff',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Annual Percentage Yield',
          color: '#ffffff',
          font: {
            family: 'Orbitron'
          }
        }
      }
    },
  };

  return (
    <div className="card">
      <h2 className="text-xl font-cyber mb-4">Protocol Yield Comparison</h2>
      <div style={{ height: '280px' }}>
        <Bar data={data} options={options} />
      </div>
      <div className="mt-3 text-xs text-gray-400 text-center">
        Current yield rates across major DeFi protocols
      </div>
    </div>
  );
};

export default YieldComparison;