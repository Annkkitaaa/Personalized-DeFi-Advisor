// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useWallet } from '../contexts/WalletContext';
import { FaEthereum, FaChartLine, FaExchangeAlt, FaGasPump, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { getMarketData, getWalletData, clearApiCache } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import YieldComparison from '../components/visualizations/YieldComparison';
import Overview from '../components/dashboard/Overview';
import StrategyCard from '../components/dashboard/StrategyCard';
import AssetAllocation from '../components/visualizations/AssetAllocation';
import ProtocolMetrics from '../components/dashboard/ProtocolMetrics';
import GasTracker from '../components/dashboard/GasTracker';

// Debug panel component
const DebugPanel = ({ data, title = "Debug Data" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!data) return null;
  
  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-card-bg border border-cyber-purple z-50">
      <div 
        className="p-2 bg-cyber-black cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-cyber-blue text-sm font-cyber">{title}</h3>
        <span className="text-white">{isOpen ? '▼' : '▲'}</span>
      </div>
      
      {isOpen && (
        <div className="p-4 text-xs overflow-auto" style={{ maxHeight: '50vh' }}>
          <pre className="text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { profile, riskProfile, isProfileComplete } = useUserProfile();
  const { address, balance } = useWallet();
  const [marketData, setMarketData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  
  // Keep references to abort controllers for cleanup
  const abortControllersRef = useRef([]);
  
  // Create an abort controller and store it
  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    abortControllersRef.current.push(controller);
    return controller;
  }, []);
  
  // Cancel all pending requests
  const cancelAllRequests = useCallback(() => {
    abortControllersRef.current.forEach(controller => {
      try {
        controller.abort();
      } catch (e) {
        // Ignore errors when aborting
      }
    });
    abortControllersRef.current = [];
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    // Cancel any previous requests
    cancelAllRequests();
    
    // Create new abort controller for this fetch
    const controller = createAbortController();
    const signal = controller.signal;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch market data with retry logic
      console.log('Dashboard: Fetching market data...');
      const market = await getMarketData({ signal });
      setApiResponse(market); // Store the raw response for debugging
      
      if (!market || !market.success) {
        throw new Error(market?.error || 'Invalid market data response');
      }
      
      console.log('Dashboard: Market data received:', market.data);
      setMarketData(market.data);
      
      // Fetch wallet data if connected
      if (address) {
        console.log('Dashboard: Fetching wallet data...');
        const wallet = await getWalletData(address, { signal });
        if (wallet && wallet.success && wallet.data) {
          setWalletData(wallet.data);
        }
      }
      
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      // Skip error handling for aborted requests
      if (err.name === 'AbortError') {
        console.log('Dashboard: Request was aborted');
        return;
      }
      
      console.error('Error fetching dashboard data:', err);
      
      // Determine if we should retry based on the error type
      if ((err.name === 'TimeoutError' || 
           err.message.includes('timeout') || 
           err.message.includes('No response received')) && 
          retryCount < 2) {
        
        console.log(`Dashboard: Retrying fetch (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
        
        // Clear API cache before retry
        clearApiCache();
        
        // Wait a moment before retrying
        setTimeout(() => {
          fetchData();
        }, 2000);
        
        return;
      }
      
      setError(err.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      // Only set loading to false if we're not retrying
      if (!(error && retryCount < 2)) {
        setLoading(false);
      }
    }
  }, [address, cancelAllRequests, createAbortController, retryCount, error]);

  useEffect(() => {
    // If profile isn't complete, redirect to home for setup
    if (!isProfileComplete) {
      navigate('/#riskprofile');
      return;
    }

    // Fetch data initially
    fetchData();

    // Set up regular refresh interval (every 60 seconds)
    const refreshInterval = setInterval(() => {
      console.log('Dashboard: Refreshing data...');
      fetchData();
    }, 60000);
    
    // Cleanup function
    return () => {
      clearInterval(refreshInterval);
      cancelAllRequests();
    };
  }, [fetchData, isProfileComplete, navigate, cancelAllRequests]);

  // Placeholder data for price chart with real ETH price if available
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

  // Handle retry button click
  const handleRetry = () => {
    setRetryCount(0);
    clearApiCache();
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white font-cyber">Loading market data{retryCount > 0 ? ` (Retry ${retryCount}/2)` : ''}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-cyber-pink text-5xl mb-4">!</div>
        <h2 className="text-xl font-cyber mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-400 mb-2">{error}</p>
        <details className="mb-6 text-xs text-gray-500">
          <summary>Technical Details</summary>
          <pre className="mt-2 p-2 bg-black bg-opacity-50 rounded text-left overflow-auto max-w-md">
            {JSON.stringify(apiResponse || {}, null, 2)}
          </pre>
        </details>
        <button 
          onClick={handleRetry} 
          className="cyber-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Get allocation percentages based on risk profile and market trend
  const getAllocation = () => {
    // Default to neutral if marketData or marketTrend is missing
    if (!marketData || !marketData.marketTrend) {
      return riskProfile === 'conservative'
        ? { 'Stablecoins': '70-80%', 'Ethereum': '15-25%', 'Altcoins': '5-10%' }
        : riskProfile === 'aggressive'
          ? { 'Stablecoins': '20-30%', 'Ethereum': '40-50%', 'Altcoins': '25-35%' }
          : { 'Stablecoins': '40-50%', 'Ethereum': '30-40%', 'Altcoins': '15-25%' }; // moderate
    }
    
    // Safely extract market trend
    const marketTrend = typeof marketData.marketTrend === 'string' 
      ? marketData.marketTrend 
      : (marketData.marketTrend && marketData.marketTrend.trend) ? marketData.marketTrend.trend : 'neutral';
    
    if (riskProfile === 'conservative') {
      return marketTrend === 'bearish' 
        ? { 'Stablecoins': '75-85%', 'Ethereum': '10-20%', 'Altcoins': '5-10%' }
        : { 'Stablecoins': '65-75%', 'Ethereum': '15-25%', 'Altcoins': '5-15%' };
    } else if (riskProfile === 'aggressive') {
      return marketTrend === 'bearish'
        ? { 'Stablecoins': '30-40%', 'Ethereum': '40-50%', 'Altcoins': '20-30%' }
        : { 'Stablecoins': '15-25%', 'Ethereum': '45-55%', 'Altcoins': '25-35%' };
    } else { // moderate
      return marketTrend === 'bearish'
        ? { 'Stablecoins': '50-60%', 'Ethereum': '30-40%', 'Altcoins': '10-20%' }
        : { 'Stablecoins': '40-50%', 'Ethereum': '35-45%', 'Altcoins': '15-25%' };
    }
  };

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
        
        {/* Market Overview Card */}
        <div className="mb-6">
          <Overview marketData={marketData} />
        </div>
        
        {/* Strategy Card */}
        <div className="mb-6">
          <StrategyCard marketData={marketData} />
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ETH Price Chart */}
          <div className="card">
            <h2 className="text-xl font-cyber mb-4">ETH Price (7-Day Trend)</h2>
            <div className="h-64">
              <Line data={priceChartData} options={chartOptions} />
            </div>
          </div>
          
          {/* Asset Allocation */}
          <AssetAllocation allocation={getAllocation()} />
        </div>

        {/* Protocol Metrics */}
        <div className="mb-6">
          <ProtocolMetrics protocolData={marketData?.protocolData} />
        </div>
        
        {/* Additional Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Protocol Yields */}
          <YieldComparison protocolData={marketData?.protocolData} />
          
          {/* Gas Tracker */}
          <GasTracker initialGasPrice={marketData?.gasPrice} />
          
          {/* Wallet Overview */}
          <div className="card">
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
                        token !== 'ETH' && data && (
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
                  onClick={() => document.querySelector('button[onClick="connectWallet"]')?.click()}
                  className="cyber-button"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Debug Panel - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel data={{ marketData, apiResponse, error, retryCount }} title="Dashboard Debug" />
      )}
    </div>
  );
};

export default Dashboard;