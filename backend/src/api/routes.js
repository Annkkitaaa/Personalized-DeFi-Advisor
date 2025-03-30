const express = require('express');
const router = express.Router();
const advisor = require('../ai/advisor');
const UserProfile = require('../models/userProfile');
const ethClient = require('../blockchain/ethClient');
const contractInteraction = require('../blockchain/contractInteraction');

// Generate DeFi advice
router.post('/advice', async (req, res) => {
  try {
    const { riskTolerance, timeHorizon, capital, experience, walletAddress } = req.body;
    
    // Validate user profile data
    const userProfile = new UserProfile({
      riskTolerance,
      timeHorizon,
      capital,
      experience
    });
    
    // Generate personalized advice
    const advice = await advisor.generatePersonalizedAdvice(userProfile, walletAddress);
    
    res.json({ success: true, advice });
  } catch (error) {
    console.error('API error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to generate advice' 
    });
  }
});

// Get current DeFi market data
router.get('/market', async (req, res) => {
  try {
    const ethPrice = await ethClient.getEthPrice();
    const gasPrice = await ethClient.getGasPrice();
    const marketTrend = await ethClient.getMarketTrend();
    const protocolData = await ethClient.getAllProtocolData();
    
    res.json({
      success: true,
      data: {
        ethPrice,
        gasPrice,
        marketTrend,
        protocolData
      }
    });
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch market data'
    });
  }
});

// Get wallet data
router.get('/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const history = await ethClient.getWalletHistory(address);
    const balances = await contractInteraction.getTokenBalances(address, {
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    });
    
    res.json({
      success: true,
      data: {
        history,
        balances
      }
    });
  } catch (error) {
    console.error('Wallet data error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch wallet data'
    });
  }
});

// Simulate DeFi operations
router.post('/simulate', async (req, res) => {
  try {
    const { type, params } = req.body;
    
    let result;
    switch (type) {
      case 'aaveDeposit':
        result = await contractInteraction.simulateAaveDeposit(
          params.assetAddress,
          params.amount,
          params.interestRateMode
        );
        break;
      case 'aaveBorrow':
        result = await contractInteraction.simulateAaveBorrow(
          params.assetAddress,
          params.collateralAddress,
          params.collateralAmount,
          params.borrowAmount
        );
        break;
      case 'uniswapLiquidity':
        result = await contractInteraction.simulateUniswapLiquidity(
          params.token0,
          params.token1,
          params.amount0,
          params.amount1
        );
        break;
      default:
        throw new Error(`Unsupported simulation type: ${type}`);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to simulate operation'
    });
  }
});

module.exports = router;