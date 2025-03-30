// frontend/src/components/dashboard/GasTracker.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { FaGasPump } from 'react-icons/fa';
import { getMarketData } from '../../services/api';

const GasTracker = ({ initialGasPrice }) => {
  const [gasHistory, setGasHistory] = useState([]);
  const [currentGas, setCurrentGas] = useState(initialGasPrice || 0);
  
  useEffect(() => {
    // Initialize with the initial gas price
    if (initialGasPrice) {
      setGasHistory(prev => [...prev, {
        price: parseFloat(initialGasPrice),
        time: new Date().toLocaleTimeString()
      }]);
      setCurrentGas(initialGasPrice);
    }
    
    // Update gas price every 60 seconds
    const interval = setInterval(async () => {
      try {
        const data = await getMarketData();
        if (data && data.success && data.data && data.data.gasPrice) {
          const newGasPrice = parseFloat(data.data.gasPrice);
          setCurrentGas(newGasPrice);
          
          setGasHistory(prev => {
            // Keep only last 10 data points
            const newHistory = [...prev, {
              price: newGasPrice,
              time: new Date().toLocaleTimeString()
            }];
            
            if (newHistory.length > 10) {
              return newHistory.slice(newHistory.length - 10);
            }
            return newHistory;
          });
        }
      } catch (error) {
        console.error('Error fetching gas data:', error);
      }
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [initialGasPrice]);
  
  const getRecommendation = (price) => {
    if (price < 30) return { text: 'Low', color: 'text-green-500' };
    if (price < 60) return { text: 'Moderate', color: 'text-yellow-500' };
    return { text: 'High', color: 'text-red-500' };
  };
  
  const recommendation = getRecommendation(currentGas);
  
  const chartData = {
    labels: gasHistory.map(item => item.time),
    datasets: [
      {
        label: 'Gas Price (gwei)',
        data: gasHistory.map(item => item.price),
        borderColor: '#2de2e6',
        backgroundColor: 'rgba(45, 226, 230, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff',
          maxRotation: 45,
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1A1A2E',
        borderColor: '#2de2e6',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#ffffff'
      }
    }
  };
  
  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <FaGasPump className="text-cyber-blue mr-2" />
        <h2 className="text-xl font-cyber">Gas Price Tracker</h2>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-gray-400 text-sm">Current Gas Price</div>
          <div className="text-xl font-bold text-cyber-yellow">{currentGas} gwei</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">Transaction Cost</div>
          <div className={`text-lg font-bold ${recommendation.color}`}>{recommendation.text}</div>
        </div>
      </div>
      
      <div className="h-48">
        {gasHistory.length > 1 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Collecting gas price data...
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Low: &lt;30 gwei</span>
          <span>Medium: 30-60 gwei</span>
          <span>High: &gt;60 gwei</span>
        </div>
      </div>
    </div>
  );
};

export default GasTracker;