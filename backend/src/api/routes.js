const express = require('express');
const router = express.Router();
const advisor = require('../ai/advisor');
const UserProfile = require('../models/userProfile');
const ethClient = require('../blockchain/ethClient');
const contractInteraction = require('../blockchain/contractInteraction');

/**
 * @swagger
 * /api/advice:
 *   post:
 *     summary: Generate personalized DeFi strategy advice
 *     description: Returns a personalized DeFi strategy based on user profile and wallet data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - riskTolerance
 *               - timeHorizon
 *               - capital
 *               - experience
 *             properties:
 *               riskTolerance:
 *                 type: number
 *                 description: Risk tolerance level (1-10)
 *               timeHorizon:
 *                 type: number
 *                 description: Investment horizon in months
 *               capital:
 *                 type: number
 *                 description: Available capital in USD
 *               experience:
 *                 type: string
 *                 description: DeFi experience level
 *                 enum: [none, beginner, intermediate, advanced]
 *               walletAddress:
 *                 type: string
 *                 description: Ethereum wallet address (optional)
 *     responses:
 *       200:
 *         description: Successful response with advice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 advice:
 *                   type: object
 *       400:
 *         description: Bad request or validation error
 */
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

/**
 * @swagger
 * /api/market:
 *   get:
 *     summary: Get current DeFi market data
 *     description: Returns current market data including token prices, gas prices, and protocol yields
 *     responses:
 *       200:
 *         description: Successful response with market data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     ethPrice:
 *                       type: number
 *                     gasPrice:
 *                       type: string
 *                     marketTrend:
 *                       type: string
 *                     protocolData:
 *                       type: object
 *       500:
 *         description: Server error
 */
// In backend/src/api/routes.js - modify the /market route handler
router.get('/market', async (req, res) => {
  try {
    const ethPrice = await ethClient.getEthPrice();
    const gasPrice = await ethClient.getGasPrice();
    const marketTrendData = await ethClient.getMarketTrend();
    const protocolData = await ethClient.getAllProtocolData();
    
    // Extract just the trend string instead of sending the whole object
    const marketTrend = typeof marketTrendData === 'object' && marketTrendData.trend 
      ? marketTrendData.trend 
      : 'neutral';
    
    res.json({
      success: true,
      data: {
        ethPrice,
        gasPrice,
        marketTrend, // Now this is just a string
        marketDetails: marketTrendData, // Full data in a separate field
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

/**
 * @swagger
 * /api/wallet/{address}:
 *   get:
 *     summary: Get wallet transaction history and balances
 *     description: Returns wallet transaction history and token balances for the specified Ethereum address
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         description: Ethereum wallet address
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with wallet data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       type: array
 *                     balances:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get('/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }
    
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

/**
 * @swagger
 * /api/simulate:
 *   post:
 *     summary: Simulate DeFi operations
 *     description: Simulates DeFi operations without executing them on-chain
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - params
 *             properties:
 *               type:
 *                 type: string
 *                 description: Operation type
 *                 enum: [aaveDeposit, aaveBorrow, uniswapLiquidity]
 *               params:
 *                 type: object
 *                 description: Operation parameters (varies by type)
 *     responses:
 *       200:
 *         description: Successful response with simulation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request or validation error
 */
router.post('/simulate', async (req, res) => {
  try {
    const { type, params } = req.body;
    
    if (!type || !params) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: type and params'
      });
    }
    
    let result;
    switch (type) {
      case 'aaveDeposit':
        if (!params.assetAddress || !params.amount) {
          throw new Error('Missing required parameters for aaveDeposit');
        }
        result = await contractInteraction.simulateAaveDeposit(
          params.assetAddress,
          params.amount,
          params.interestRateMode
        );
        break;
      case 'aaveBorrow':
        if (!params.assetAddress || !params.collateralAddress || 
            !params.collateralAmount || !params.borrowAmount) {
          throw new Error('Missing required parameters for aaveBorrow');
        }
        result = await contractInteraction.simulateAaveBorrow(
          params.assetAddress,
          params.collateralAddress,
          params.collateralAmount,
          params.borrowAmount
        );
        break;
      case 'uniswapLiquidity':
        if (!params.token0 || !params.token1 || !params.amount0 || !params.amount1) {
          throw new Error('Missing required parameters for uniswapLiquidity');
        }
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

/**
 * @swagger
 * /api/protocols:
 *   get:
 *     summary: Get DeFi protocol information
 *     description: Returns information about available DeFi protocols and their current rates
 *     responses:
 *       200:
 *         description: Successful response with protocol data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/protocols', async (req, res) => {
  try {
    const protocolData = await ethClient.getAllProtocolData();
    
    res.json({
      success: true,
      data: protocolData
    });
  } catch (error) {
    console.error('Protocol data error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch protocol data'
    });
  }
});

module.exports = router;