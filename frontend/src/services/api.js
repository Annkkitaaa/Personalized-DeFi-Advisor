// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create a cache for responses to prevent duplicate requests
const responseCache = new Map();
const CACHE_EXPIRY = 30000; // 30 seconds cache expiry

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // Increased to 60 seconds
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    let errorMessage = 'An unknown error occurred';
    
    // Don't handle aborted requests as errors
    if (axios.isCancel(error)) {
      const cancelError = new Error('Request was cancelled');
      cancelError.name = 'AbortError';
      return Promise.reject(cancelError);
    }
    
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
    enhancedError.name = error.name === 'TimeoutError' ? 'TimeoutError' : 'ApiError';
    
    return Promise.reject(enhancedError);
  }
);

// Helper function to get cached response or make new request
const getCachedOrFetch = async (url, options = {}) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Check if we have a valid cached response
  if (responseCache.has(cacheKey)) {
    const { data, timestamp } = responseCache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      console.log(`API: Using cached response for ${url}`);
      return data;
    }
  }
  
  // No valid cache, make the request
  const response = await api.get(url, options);
  
  // Cache the response
  responseCache.set(cacheKey, {
    data: response,
    timestamp: Date.now()
  });
  
  return response;
};

export const getAdvice = async (profileData, walletAddress, options = {}) => {
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
    
    console.log('API: Requesting advice with data:', requestData);
    
    const response = await api.post('/advice', requestData, options);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('API: Error fetching advice:', error);
    throw error;
  }
};

export const getMarketData = async (options = {}) => {
  try {
    console.log('API: Fetching market data...');
    
    // Use cached response if available
    const response = await getCachedOrFetch('/market', options);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Simplify validation logic
    if (!response.data.success) {
      throw new Error(response.data.error || 'Server returned an error');
    }
    
    return response.data;
  } catch (error) {
    // Rethrow AbortError without logging
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.error('API: Error fetching market data:', error);
    throw error;
  }
};

export const getWalletData = async (address, options = {}) => {
  if (!address) {
    throw new Error('Wallet address is required');
  }
  
  try {
    console.log(`API: Fetching wallet data for ${address}...`);
    
    // Use cached response if available
    const response = await getCachedOrFetch(`/wallet/${address}`, options);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    // Rethrow AbortError without logging
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.error('API: Error fetching wallet data:', error);
    throw error;
  }
};

export const simulateOperation = async (type, params, options = {}) => {
  try {
    if (!type || !params) {
      throw new Error('Operation type and parameters are required');
    }
    
    console.log(`API: Simulating ${type} operation with params:`, params);
    const response = await api.post('/simulate', { type, params }, options);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Simulation failed');
    }
    
    console.log(`API: ${type} simulation results:`, response.data);
    return response.data;
  } catch (error) {
    // Rethrow AbortError without logging
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.error(`API: Error simulating ${type} operation:`, error);
    throw error;
  }
};

export const getProtocolsData = async (options = {}) => {
  try {
    console.log('API: Fetching protocols data...');
    
    // Use cached response if available
    const response = await getCachedOrFetch('/protocols', options);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    // Rethrow AbortError without logging
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.error('API: Error fetching protocols data:', error);
    throw error;
  }
};

// Helper function to clear cache
export const clearApiCache = () => {
  responseCache.clear();
  console.log('API: Cache cleared');
};

export default api;