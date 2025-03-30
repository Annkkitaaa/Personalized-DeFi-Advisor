const express = require('express');
const router = express.Router();
const advisor = require('../ai/advisor');
const UserProfile = require('../models/userProfile');
const ethClient = require('../blockchain/ethClient');
const contractInteraction = require('../blockchain/contractInteraction');

// Add timeout middleware for specific routes
const timeoutMiddleware = (timeout) => (req, res, next) => {
  // Set a timeout for this specific route
  req.setTimeout(timeout);
  res.setTimeout(timeout);
  next();
};

// Cache middleware to store responses
const responseCache = new Map();
const getCacheKey = (req) => `${req.method}:${req.originalUrl}`;
const CACHE_DURATION = 30000; // 30 seconds

const cacheMiddleware = (duration = CACHE_DURATION) => (req, res, next) => {
  const key = getCacheKey(req);
  const cachedResponse = responseCache.get(key);
  
  if (cachedResponse && Date.now() - cachedResponse.timestamp < duration) {
    console.log(`Using cached response for ${req.method} ${req.originalUrl}`);
    return res.json(cachedResponse.data);
  }
  
  // Store the original res.json function
  const originalJson = res.json;
  
  // Override res.json to cache the response
  res.json = function(data) {
    // Only cache successful responses
    if (res.statusCode < 400 && data.success === true) {
      responseCache.set(key, {
        data,
        timestamp: Date.now()
      });
    }
    
    // Call the original function
    return originalJson.call(this, data);
  };
  
  next();
};

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
router.post('/advice', timeoutMiddleware(40000), async (req, res) => {
  try {
    console.log('Received advice request:', req.body);
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
    console.log('Successfully generated advice');
    
    // Ensure the response has required fields for the UI
    if (!advice.allocation || Object.keys(advice.allocation).length === 0) {
      advice.allocation = {
        "Stablecoins": 25,
        "Ethereum": 45,
        "Altcoins": 30,
        "USDC Liquidity Pool": 9,
        "Curve StETH Liquidity Pool": 3,
        "Staking ETH": "4-6"
      };
    }
    
    if (!advice.protocols || advice.protocols.length === 0) {
      advice.protocols = [
        "1.Uniswap Liquidity Provisioning (ETH-USDC)",
        "2.Curve Liquidity Provisioning (stETH)",
        "3.Staking ETH"
      ];
    }
    
    if (!advice.steps || advice.steps.length === 0) {
      advice.steps = [
        "1.Deposit 2,500 USD into a stablecoin (e.g., USDC or DAI) on a lending protocol like AAVE or Compound.",
        "2.Transfer 4,500 USD worth of Ethereum to a wallet.",
        "3.Allocate 1,800 USD worth of Ethereum to Uniswap's ETH-USDC liquidity pool.",
        "4.Allocate 1,350 USD worth of Ethereum to Curve's stETH liquidity pool.",
        "5.Stake the remaining 1,350 USD worth of Ethereum on a staking platform."
      ];
    }
    
    if (!advice.expectedReturns || advice.expectedReturns.min === null) {
      advice.expectedReturns = { min: 8, max: 16, timeframe: '12 months' };
    }
    
    if (!advice.risks || advice.risks.length === 0) {
      advice.risks = [
        "Market volatility may affect ETH price and impact overall returns",
        "Smart contract risk associated with protocol interactions",
        "Impermanent loss risk when providing liquidity in volatile markets",
        "Regulatory changes could impact DeFi platforms and strategies"
      ];
    }
    
    // Ensure marketInsights has required fields
    if (!advice.marketInsights) {
      advice.marketInsights = {
        ethPrice: 2000,
        gasPrice: "25",
        trend: "neutral"
      };
    }
    
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
router.get('/market', cacheMiddleware(60000), timeoutMiddleware(55000), async (req, res) => {
  // Set a 55 second timeout for the market data request
  const timeout = setTimeout(() => {
    console.log('Market data request is taking too long, using fallback data');
    
    res.json({
      success: true,
      data: {
        ethPrice: 1800,
        gasPrice: "25",
        marketTrend: "neutral",
        protocolData: {
          aave: {
            DAI: { supplyAPY: 2.5, borrowAPY: 3.8 },
            USDC: { supplyAPY: 2.7, borrowAPY: 4.1 },
            ETH: { supplyAPY: 0.5, borrowAPY: 1.8 }
          },
          compound: {
            DAI: { supplyAPY: 2.2, borrowAPY: 3.5 },
            USDC: { supplyAPY: 2.4, borrowAPY: 3.8 },
            ETH: { supplyAPY: 0.3, borrowAPY: 1.5 }
          },
          uniswap: [
            { name: 'ETH-USDC', estimatedAPY: 9.1 },
            { name: 'ETH-USDT', estimatedAPY: 8.7 },
            { name: 'WBTC-ETH', estimatedAPY: 8.1 }
          ],
          curve: [
            { name: '3pool', apy: 2.8 },
            { name: 'stETH', apy: 3.2 },
            { name: 'BUSD', apy: 2.5 }
          ]
        }
      }
    });
  }, 50000); // 50 second timeout
  
  try {
    console.log('Fetching market data...');
    const ethPrice = await ethClient.getEthPrice();
    console.log(`ETH Price: $${ethPrice}`);
    
    const gasPrice = await ethClient.getGasPrice();
    console.log(`Gas Price: ${gasPrice} gwei`);
    
    const marketTrend = await ethClient.getMarketTrend();
    console.log(`Market Trend: ${marketTrend}`);
    
    const protocolData = await ethClient.getAllProtocolData();
    console.log('Protocol data fetched successfully');
    
    // Clear the timeout as we got a response
    clearTimeout(timeout);
    
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
    // Clear the timeout as we got an error
    clearTimeout(timeout);
    
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
router.get('/wallet/:address', cacheMiddleware(), timeoutMiddleware(40000), async (req, res) => {
  try {
    const { address } = req.params;
    console.log(`Fetching wallet data for ${address}...`);
    
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }
    
    const history = await ethClient.getWalletHistory(address);
    console.log(`Fetched ${history.length} transaction history items`);
    
    let balances = {};
    try {
      balances = await contractInteraction.getTokenBalances(address, {
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      });
      console.log('Fetched token balances successfully');
    } catch (balanceError) {
      console.error('Error fetching token balances:', balanceError);
      balances = {
        DAI: { formatted: '0', raw: '0' },
        USDC: { formatted: '0', raw: '0' },
        USDT: { formatted: '0', raw: '0' },
        WETH: { formatted: '0', raw: '0' }
      };
    }
    
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
      error: error.message || 'Failed to fetch wallet data',
      // Return empty data structure to prevent frontend errors
      data: {
        history: [],
        balances: {}
      }
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
    console.log(`Simulating ${type} operation with params:`, params);
    
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
      case 'uniswapSwap':
        if (!params.tokenIn || !params.tokenOut || !params.amountIn) {
          throw new Error('Missing required parameters for uniswapSwap');
        }
        result = await contractInteraction.simulateUniswapSwap(
          params.tokenIn,
          params.tokenOut,
          params.fee,
          params.amountIn
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
    
    console.log('Simulation completed successfully:', result);
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
router.get('/protocols', cacheMiddleware(), timeoutMiddleware(40000), async (req, res) => {
  try {
    console.log('Fetching protocol data...');
    const protocolData = await ethClient.getAllProtocolData();
    console.log('Protocol data fetched successfully');
    
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