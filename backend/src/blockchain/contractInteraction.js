const { ethers } = require('ethers');

// ABIs for common DeFi protocols (simplified versions)
const aaveV3PoolABI = [
  "function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
  "function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external"
];

const compoundCTokenABI = [
  "function supplyRatePerBlock() external view returns (uint)",
  "function borrowRatePerBlock() external view returns (uint)",
  "function balanceOf(address owner) external view returns (uint)",
  "function exchangeRateCurrent() external returns (uint)"
];

const uniswapRouterABI = [
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut)",
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256 amountOut)"
];

const erc20ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

class ContractInteraction {
  constructor(provider) {
    this.provider = provider;
    
    // Common contract addresses (Mainnet)
    this.contracts = {
      aave: {
        pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2' // Aave V3 Pool
      },
      compound: {
        cETH: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
        cDAI: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
        cUSDC: '0x39AA39c021dfbaE8faC545936693aC917d5E7563'
      },
      uniswap: {
        router: '0xE592427A0AEce92De3Edee1F18E0157C05861564' // Uniswap V3 Router
      },
      tokens: {
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      }
    };
  }
  
  // Simulate deposit to Aave with real data
  async simulateAaveDeposit(assetAddress, amount, interestRateMode = 1) {
    try {
      const pool = new ethers.Contract(
        this.contracts.aave.pool,
        aaveV3PoolABI,
        this.provider
      );
      
      // Get current liquidity and reserve data
      const reserveData = await pool.getReserveData(assetAddress);
      
      // Calculate expected interest
      const liquidityRate = ethers.utils.formatUnits(reserveData.currentLiquidityRate, 27);
      const annualInterest = amount * liquidityRate;
      
      // Get token details
      const token = new ethers.Contract(assetAddress, erc20ABI, this.provider);
      const symbol = await token.symbol();
      const decimals = await token.decimals();
      
      return {
        token: symbol,
        depositAmount: amount,
        amountFormatted: ethers.utils.formatUnits(amount.toString(), decimals),
        expectedAnnualInterest: annualInterest,
        expectedAnnualInterestFormatted: annualInterest.toFixed(4),
        apy: parseFloat(liquidityRate) * 100,
        healthFactor: 'N/A (Deposit only)',
        liquidityIndex: ethers.utils.formatUnits(reserveData.liquidityIndex, 27),
        variableBorrowRate: ethers.utils.formatUnits(reserveData.currentVariableBorrowRate, 27),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error simulating Aave deposit:', error);
      throw new Error('Failed to simulate Aave deposit: ' + error.message);
    }
  }
  
  // Get token balances for a wallet
  async getTokenBalances(walletAddress, tokenAddresses) {
    const balances = {};
    
    for (const [symbol, address] of Object.entries(tokenAddresses)) {
      const token = new ethers.Contract(address, erc20ABI, this.provider);
      
      try {
        const balance = await token.balanceOf(walletAddress);
        const decimals = await token.decimals();
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        
        balances[symbol] = {
          raw: balance.toString(),
          formatted: formattedBalance,
          address
        };
      } catch (error) {
        console.error(`Error fetching balance for ${symbol}:`, error);
        balances[symbol] = {
          raw: '0',
          formatted: '0',
          address,
          error: error.message
        };
      }
    }
    
    // Also get ETH balance
    try {
      const ethBalance = await this.provider.getBalance(walletAddress);
      balances['ETH'] = {
        raw: ethBalance.toString(),
        formatted: ethers.utils.formatEther(ethBalance),
        address: 'native'
      };
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      balances['ETH'] = {
        raw: '0',
        formatted: '0',
        address: 'native',
        error: error.message
      };
    }
    
    return balances;
  }
  
  // Generate transaction data for frontend
  generateTransactionData(type, params) {
    switch (type) {
      case 'aaveDeposit':
        return this._generateAaveDepositTx(params);
      case 'aaveBorrow':
        return this._generateAaveBorrowTx(params);
      case 'uniswapSwap':
        return this._generateUniswapSwapTx(params);
      case 'approve':
        return this._generateApproveTx(params);
      default:
        throw new Error(`Unsupported transaction type: ${type}`);
    }
  }
  
  _generateAaveDepositTx({ asset, amount, onBehalfOf }) {
    const aavePool = new ethers.Contract(
      this.contracts.aave.pool,
      aaveV3PoolABI,
      this.provider
    );
    
    return {
      to: this.contracts.aave.pool,
      data: aavePool.interface.encodeFunctionData('supply', [
        asset,
        amount,
        onBehalfOf || '0x0000000000000000000000000000000000000000',
        0 // referralCode
      ])
    };
  }
  
  _generateAaveBorrowTx({ asset, amount, interestRateMode, onBehalfOf }) {
    const aavePool = new ethers.Contract(
      this.contracts.aave.pool,
      aaveV3PoolABI,
      this.provider
    );
    
    return {
      to: this.contracts.aave.pool,
      data: aavePool.interface.encodeFunctionData('borrow', [
        asset,
        amount,
        interestRateMode || 2, // 1 for stable, 2 for variable
        0, // referralCode
        onBehalfOf || '0x0000000000000000000000000000000000000000'
      ])
    };
  }
  
  _generateUniswapSwapTx({ tokenIn, tokenOut, fee, amountIn, recipient, deadline }) {
    const uniswapRouter = new ethers.Contract(
      this.contracts.uniswap.router,
      uniswapRouterABI,
      this.provider
    );
    
    const params = {
      tokenIn,
      tokenOut,
      fee: fee || 3000, // 0.3% by default
      recipient: recipient || '0x0000000000000000000000000000000000000000',
      deadline: deadline || Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      amountIn,
      amountOutMinimum: 0, // No slippage protection for simulation
      sqrtPriceLimitX96: 0 // No price limit
    };
    
    return {
      to: this.contracts.uniswap.router,
      data: uniswapRouter.interface.encodeFunctionData('exactInputSingle', [params])
    };
  }
  
  _generateApproveTx({ token, spender, amount }) {
    const erc20Contract = new ethers.Contract(token, erc20ABI, this.provider);
    
    return {
      to: token,
      data: erc20Contract.interface.encodeFunctionData('approve', [
        spender,
        amount
      ])
    };
  }
}

module.exports = new ContractInteraction(
  new ethers.providers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`)
);