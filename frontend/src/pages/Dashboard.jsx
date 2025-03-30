import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useWallet } from '../contexts/WalletContext';
import { FaEthereum, FaChartLine, FaExchangeAlt, FaGasPump, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { getMarketData, getWalletData } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { profile, riskProfile, isProfileComplete } = useUserProfile();
  const { address, balance } = useWallet();
  const [marketData, setMarketData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If profile isn't complete, redirect to home for setup
    if (!isProfileComplete) {
      navigate('/#riskprofile');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch market data
        const market = await getMarketData();
        setMarketData(market.data);
        
        // Fetch wallet data if connected
        if (address) {
          const wallet = await getWalletData(address);
          setWalletData(wallet.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [address, isProfileComplete, navigate]);

  // Placeholder data for price chart
  const priceChartData = {
    labels: ['7d', '6d', '5d', '4d', '3d', '2d', '1d', 'Now'],
    datasets: [
      {
        label: 'ETH Price',
        data: marketData ? [
          marketData.ethPrice * 0.95,
          marketData.ethPrice * 0.97,
          marketData.ethPrice * 0.96,
          marketData.ethPrice * 0.98,
          marketData.ethPrice * 1.01,
          marketData.ethPrice * 0.99,
          marketData.ethPrice * 1.02,
          marketData.ethPrice
        ] : [2900, 2950, 2925, 2975, 3050, 3025, 3075, 3000],
        borderColor: '#2de2e6',
        backgroundColor: 'rgba(45, 226, 230, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1A1A2E',
        borderColor: '#2de2e6',
        borderWidth: 1,
        titleColor: '#2de2e6',
        bodyColor: '#ffffff',
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(45, 226, 230, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      y: {
        grid: {
          color: 'rgba(45, 226, 230, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white font-cyber">Loading market data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-cyber-pink text-5xl mb-4">!</div>
        <h2 className="text-xl font-cyber mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="cyber-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-cyber mb-6">
          <span className="text-white">Market</span>
          <span className="text-cyber-blue"> Dashboard</span>
        </h1>
        
        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MarketCard 
            title="ETH Price" 
            value={`$${marketData?.ethPrice?.toFixed(2) || '0.00'}`}
            icon={<FaEthereum />}
            change={marketData?.priceChange1d?.toFixed(2) || '0.00'}
            isPositive={marketData?.priceChange1d > 0}
          />
          <MarketCard 
            title="Gas Price" 
            value={`${marketData?.gasPrice || '0'} gwei`}
            icon={<FaGasPump />}
          />
          <MarketCard 
            title="Market Trend" 
            value={marketData?.marketTrend || 'Neutral'}
            icon={<FaChartLine />}
            trendColor={
              marketData?.marketTrend === 'bullish' ? 'text-green-500' :
              marketData?.marketTrend === 'bearish' ? 'text-red-500' :
              'text-yellow-500'
            }
          />
          <MarketCard 
            title="Your Risk Profile" 
            value={riskProfile || 'Not Set'}
            icon={<FaExchangeAlt />}
            riskColor={
              riskProfile === 'conservative' ? 'text-cyber-blue' :
              riskProfile === 'aggressive' ? 'text-cyber-pink' :
              'text-cyber-yellow'
            }
          />
        </div>
        
        {/* ETH Price Chart */}
        <div className="card mb-8">
          <h2 className="text-xl font-cyber mb-4">ETH Price (7-Day Trend)</h2>
          <div className="h-64">
            <Line data={priceChartData} options={chartOptions} />
          </div>
        </div>
        
        {/* Additional Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Protocol Yields */}
          <div className="card col-span-1">
            <h2 className="text-xl font-cyber mb-4">Top Protocol Yields</h2>
            {marketData && marketData.protocolData ? (
              <div className="space-y-3">
                <ProtocolYield 
                  name="Aave - USDC" 
                  apy={(marketData.protocolData.aave?.USDC?.supplyAPY || 2.7).toFixed(2)} 
                  risk="Low"
                />
                <ProtocolYield 
                  name="Compound - DAI" 
                  apy={(marketData.protocolData.compound?.DAI?.supplyAPY || 2.5).toFixed(2)} 
                  risk="Low"
                />
                <ProtocolYield 
                  name="Uniswap - ETH/USDC" 
                  apy={(marketData.protocolData.uniswap?.[0]?.estimatedAPY || 15.7).toFixed(2)} 
                  risk="Medium"
                />
                <ProtocolYield 
                  name="Curve - 3pool" 
                  apy={(marketData.protocolData.curve?.[0]?.apy || 2.8).toFixed(2)} 
                  risk="Low"
                />
              </div>
            ) : (
              <p className="text-gray-400">No protocol data available</p>
            )}
          </div>
          
          {/* Wallet Overview */}
          <div className="card col-span-1">
            <h2 className="text-xl font-cyber mb-4">Wallet Overview</h2>
            {address ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Connected Address:</p>
                  <p className="font-mono text-sm truncate">{address}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">ETH Balance:</p>
                  <p className="text-cyber-yellow font-bold text-lg">{parseFloat(balance).toFixed(4)} ETH</p>
                </div>
                {walletData?.balances && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Token Balances:</p>
                    <div className="space-y-2">
                      {Object.entries(walletData.balances).map(([token, data]) => (
                        token !== 'ETH' && (
                          <div key={token} className="flex justify-between items-center">
                            <span>{token}</span>
                            <span className="font-mono">{parseFloat(data.formatted).toFixed(2)}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">Connect your wallet to see your balances</p>
                <button 
                  onClick={() => document.querySelector('[onClick="connectWallet"]')?.click()}
                  className="cyber-button"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
          
          {/* Strategy Recommendation */}
          <div className="card col-span-1">
            <h2 className="text-xl font-cyber mb-4">Strategy Recommendation</h2>
            <p className="text-gray-300 mb-4">
              Based on your <span className={
                riskProfile === 'conservative' ? 'text-cyber-blue' :
                riskProfile === 'aggressive' ? 'text-cyber-pink' :
                'text-cyber-yellow'
              }>{riskProfile}</span> risk profile and current market conditions:
            </p>
            <div className="mb-4">
              <h3 className="font-cyber text-md mb-2">Recommended Asset Allocation:</h3>
              <div className="space-y-2">
                {riskProfile === 'conservative' && (
                  <>
                    <ProgressBar label="Stablecoins" percentage={75} color="cyber-blue" />
                    <ProgressBar label="Ethereum" percentage={15} color="cyber-yellow" />
                    <ProgressBar label="Altcoins" percentage={10} color="cyber-pink" />
                  </>
                )}
                {riskProfile === 'moderate' && (
                  <>
                    <ProgressBar label="Stablecoins" percentage={50} color="cyber-blue" />
                    <ProgressBar label="Ethereum" percentage={35} color="cyber-yellow" />
                    <ProgressBar label="Altcoins" percentage={15} color="cyber-pink" />
                  </>
                )}
                {riskProfile === 'aggressive' && (
                  <>
                    <ProgressBar label="Stablecoins" percentage={25} color="cyber-blue" />
                    <ProgressBar label="Ethereum" percentage={45} color="cyber-yellow" />
                    <ProgressBar label="Altcoins" percentage={30} color="cyber-pink" />
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/strategy')}
              className="cyber-button w-full"
            >
              View Detailed Strategy
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MarketCard = ({ title, value, icon, change, isPositive, trendColor, riskColor }) => (
  <div className="card flex flex-col h-full">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-cyber text-gray-400">{title}</h3>
      <span className="text-cyber-blue">{icon}</span>
    </div>
    <div className="flex-grow">
      <p className={`text-2xl font-bold ${trendColor || riskColor || 'text-white'}`}>{value}</p>
    </div>
    {change && (
      <div className={`flex items-center mt-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
        <span className="ml-1 text-sm">{change}%</span>
      </div>
    )}
  </div>
);

const ProtocolYield = ({ name, apy, risk }) => (
  <div className="flex justify-between items-center p-2 border border-white border-opacity-10 rounded-md hover:border-cyber-blue transition-colors">
    <span>{name}</span>
    <div className="flex items-center">
      <span className="text-cyber-yellow font-bold mr-2">{apy}%</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        risk === 'Low' ? 'bg-cyber-blue bg-opacity-20 text-cyber-blue' :
        risk === 'Medium' ? 'bg-cyber-yellow bg-opacity-20 text-cyber-yellow' :
        'bg-cyber-pink bg-opacity-20 text-cyber-pink'
      }`}>{risk}</span>
    </div>
  </div>
);

const ProgressBar = ({ label, percentage, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm">{label}</span>
      <span className="text-sm">{percentage}%</span>
    </div>
    <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
      <div 
        className={`bg-${color} h-full rounded-full`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export default Dashboard;