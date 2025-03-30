// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    let errorMessage = 'An unknown error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data?.error || 
                     `Server error: ${error.response.status} ${error.response.statusText}`;
      console.error('API error response:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from server. Please check your connection.';
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
      console.error('Request setup error:', error.message);
    }
    
    // Create a new error with the message
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

export const getAdvice = async (profileData, walletAddress) => {
  try {
    if (!profileData) {
      throw new Error('Profile data is required');
    }
    
    // Ensure we send the correct data format
    const requestData = {
      riskTolerance: profileData.riskTolerance || 5,
      timeHorizon: profileData.timeHorizon || 12,
      capital: profileData.capital || 10000,
      experience: profileData.experience || 'beginner',
      walletAddress: walletAddress || null
    };
    
    console.log('Requesting advice with data:', requestData);
    
    const response = await api.post('/advice', requestData);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching advice:', error);
    throw error;
  }
};

export const getMarketData = async () => {
  try {
    console.log('Fetching market data...');
    const response = await api.get('/market');
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

export const getWalletData = async (address) => {
  if (!address) {
    throw new Error('Wallet address is required');
  }
  
  try {
    console.log(`Fetching wallet data for ${address}...`);
    const response = await api.get(`/wallet/${address}`);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    throw error;
  }
};

export const simulateOperation = async (type, params) => {
  try {
    if (!type || !params) {
      throw new Error('Operation type and parameters are required');
    }
    
    console.log(`Simulating ${type} operation with params:`, params);
    const response = await api.post('/simulate', { type, params });
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Simulation failed');
    }
    
    console.log(`${type} simulation results:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error simulating ${type} operation:`, error);
    throw error;
  }
};

export const getProtocolsData = async () => {
  try {
    console.log('Fetching protocols data...');
    const response = await api.get('/protocols');
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching protocols data:', error);
    throw error;
  }
};

export default api;