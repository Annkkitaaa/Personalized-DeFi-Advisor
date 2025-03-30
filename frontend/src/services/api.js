import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getAdvice = async (profileData, walletAddress) => {
  try {
    // Ensure we send the correct data format
    const requestData = {
      riskTolerance: profileData.riskTolerance,
      timeHorizon: profileData.timeHorizon,
      capital: profileData.capital,
      experience: profileData.experience,
      walletAddress
    };
    
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
    const response = await api.post('/simulate', { type, params });
    return response.data;
  } catch (error) {
    console.error('Error simulating operation:', error);
    throw error;
  }
};

export default api;