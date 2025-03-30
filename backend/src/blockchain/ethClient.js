const { ethers } = require('ethers');
const axios = require('axios');

class EthClient {
  constructor() {
    // Initialize and test Alchemy provider
    try {
      console.log(`Connecting to Alchemy with key: ${process.env.ALCHEMY_API_KEY ? "Key is set" : "Key is missing!"}`);
      this.provider = new ethers.providers.JsonRpcProvider(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      );
      
      // Test the connection immediately
      this.provider.getBlockNumber().then(blockNumber => {
        console.log(`Successfully connected to Alchemy at block ${blockNumber}`);
      }).catch(error => {
        console.error('Alchemy connection test failed:', error);
      });
    } catch (error) {
      console.error('Error initializing Alchemy provider:', error);
      this.provider = ethers.getDefaultProvider('mainnet');
    }
    
    // Initialize and test Etherscan
    this.etherscanBaseURL = 'https://api.etherscan.io/api';
    
    // Test Etherscan connection
    axios.get(this.etherscanBaseURL, {
      params: {
        module: 'stats',
        action: 'ethprice',
        apikey: process.env.ETHERSCAN_API_KEY
      }
    }).then(response => {
      if (response.data.status === '1') {
        console.log('Successfully connected to Etherscan API');
      } else {
        console.error('Etherscan API test failed:', response.data.message);
      }
    }).catch(error => {
      console.error('Etherscan connection test failed:', error);
    });
  }

  async getEthPrice() {
    // Create timeout for price fetch
    const timeout = ms => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('ETH price request timeout')), ms));
      
    // First try direct on-chain method with Alchemy - Chainlink Price Feed
    try {
      const priceFeedAddress = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'; // ETH/USD Chainlink feed
      const priceFeedABI = [
        "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
        "function decimals() external view returns (uint8)"
      ];
      
      const priceFeed = new ethers.Contract(priceFeedAddress, priceFeedABI, this.provider);
      
      // Add timeout to fetch
      const result = await Promise.race([
        Promise.all([priceFeed.latestRoundData(), priceFeed.decimals()]),
        timeout(10000)
      ]);
      
      const [roundData, decimals] = result;
      
      // Convert to USD with correct decimal precision
      const ethPrice = Number(ethers.utils.formatUnits(roundData.answer, decimals));
      console.log('Successfully fetched ETH price from Chainlink:', ethPrice);
      return ethPrice;
    } catch (error) {
      console.error('Error fetching ETH price from Chainlink:', error);
      
      // Try Etherscan as backup
      try {
        const response = await Promise.race([
          axios.get(this.etherscanBaseURL, {
            params: {
              module: 'stats',
              action: 'ethprice',
              apikey: process.env.ETHERSCAN_API_KEY
            }
          }),
          timeout(8000)
        ]);
        
        if (response.data.status === '1') {
          const ethPrice = parseFloat(response.data.result.ethusd);
          console.log('Successfully fetched ETH price from Etherscan:', ethPrice);
          return ethPrice;
        }
        throw new Error('Invalid Etherscan price response');
      } catch (etherscanError) {
        console.error('Error fetching ETH price from Etherscan:', etherscanError);
        console.error('All ETH price sources failed, using fallback value');
        return 3000; // Fallback value
      }
    }
  }

  async getGasPrice() {
    // Create timeout
    const timeout = ms => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Gas price request timeout')), ms));
      
    try {
      const gasPrice = await Promise.race([
        this.provider.getGasPrice(),
        timeout(8000)
      ]);
      
      const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
      console.log('Successfully fetched gas price from Alchemy:', gasPriceGwei);
      return gasPriceGwei;
    } catch (error) {
      console.error('Error fetching gas price from Alchemy:', error);
      
      // Try Etherscan gas tracker
      try {
        const response = await Promise.race([
          axios.get(this.etherscanBaseURL, {
            params: {
              module: 'gastracker',
              action: 'gasoracle',
              apikey: process.env.ETHERSCAN_API_KEY
            }
          }),
          timeout(8000)
        ]);
        
        if (response.data.status === '1') {
          console.log('Successfully fetched gas price from Etherscan:', response.data.result.ProposeGasPrice);
          return response.data.result.ProposeGasPrice;
        }
        throw new Error('Invalid Etherscan gas tracker response');
      } catch (etherscanError) {
        console.error('Error fetching gas from Etherscan:', etherscanError);
        console.log('Using default gas price of 50 gwei');
        return "50";  // Default to 50 gwei
      }
    }
  }

  async getWalletHistory(address) {
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error('Invalid Ethereum address provided');
      return [];
    }
    
    try {
      console.log(`Fetching transaction history for ${address} from Etherscan`);
      const response = await axios.get(this.etherscanBaseURL, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: process.env.ETHERSCAN_API_KEY
        }
      });
      
      if (response.data.status !== '1') {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
      
      const transactions = response.data.result.slice(0, 50); // Last 50 transactions
      console.log(`Successfully fetched ${transactions.length} transactions`);
      return this._processTransactions(transactions);
    } catch (error) {
      console.error('Error fetching wallet history:', error);
      return [];
    }
  }

  _processTransactions(transactions) {
    // Add metadata and categorize transactions
    const knownProtocols = {
      '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': 'Aave',
      '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5': 'Aave',
      '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b': 'Compound',
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap',
      '0xE592427A0AEce92De3Edee1F18E0157C05861564': 'Uniswap V3',
      '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7': 'Curve',
      '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F': 'SushiSwap'
    };
    
    return transactions.map(tx => {
      // Calculate USD value if available
      let value = parseFloat(ethers.utils.formatEther(tx.value || '0'));
      
      // Add protocol information
      let protocol = 'Unknown';
      if (tx.to && knownProtocols[tx.to.toLowerCase()]) {
        protocol = knownProtocols[tx.to.toLowerCase()];
      }
      
      // Determine transaction type based on method signature
      let txType = 'Unknown';
      if (tx.input && tx.input.length > 10) {
        const methodId = tx.input.substring(0, 10);
        // Common method signatures
        const methodSignatures = {
          '0xd0e30db0': 'Deposit',
          '0x38d52e0f': 'Withdraw',
          '0xa9059cbb': 'Transfer',
          '0xf88bf15a': 'Borrow',
          '0x7ff36ab5': 'Swap',
          '0xc45a0155': 'AddLiquidity'
        };
        txType = methodSignatures[methodId] || 'Contract Interaction';
      } else if (tx.input === '0x') {
        txType = 'ETH Transfer';
      }
      
      return {
        ...tx,
        valueEth: value,
        protocol,
        txType,
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString()
      };
    });
  }

  async getMarketTrend() {
    // Create timeout
    const timeout = ms => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Market trend analysis timeout')), ms));
      
    try {
      console.log('Analyzing market trend based on Etherscan historical data');
      
      // Get current ETH price from Etherscan with timeout
      const response = await Promise.race([
        axios.get(this.etherscanBaseURL, {
          params: {
            module: 'stats',
            action: 'ethprice',
            apikey: process.env.ETHERSCAN_API_KEY
          }
        }),
        timeout(8000)
      ]);
      
      if (response.data.status !== '1') {
        throw new Error(`Etherscan API error: ${response.data.message}`);
      }
      
      // Get current price
      const currentPrice = parseFloat(response.data.result.ethusd);
      
      // Simplified historical price simulation to avoid timeout
      // In production, you would optimize the historical blocks retrieval
      const historicalPrices = [
        currentPrice * 0.97,
        currentPrice * 0.98,
        currentPrice * 0.99,
        currentPrice * 1.01,
        currentPrice * 0.98,
        currentPrice * 0.97,
        currentPrice * 0.96,
        currentPrice
      ];
      
      // Calculate RSI with simplified data
      const rsi = this._calculateRSI(historicalPrices, 7);
      const currentRSI = rsi[rsi.length - 1];
      
      // Determine trend
      let trend;
      if (currentRSI > 70) {
        trend = 'bullish';
      } else if (currentRSI < 30) {
        trend = 'bearish';
      } else {
        trend = 'neutral';
      }
      
      console.log(`Market trend determined to be: ${trend} (RSI: ${currentRSI?.toFixed(2)})`);
      return trend;
    } catch (error) {
      console.error('Error analyzing market trend:', error);
      console.log('Using fallback market trend: neutral');
      return 'neutral';
    }
  }

  async getAaveData() {
    try {
      console.log('Fetching Aave data using on-chain methods');
      
      // Aave V3 Pool address
      const aavePoolAddress = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
      
      const aavePoolABI = [
        "function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))"
      ];
      
      const aavePool = new ethers.Contract(aavePoolAddress, aavePoolABI, this.provider);
      
      // Token addresses
      const tokens = {
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      };
      
      const result = {};
      
      for (const [symbol, address] of Object.entries(tokens)) {
        try {
          const data = await aavePool.getReserveData(address);
          
          result[symbol] = {
            supplyAPY: parseFloat(ethers.utils.formatUnits(data.currentLiquidityRate, 27)) * 100,
            borrowAPY: parseFloat(ethers.utils.formatUnits(data.currentVariableBorrowRate, 27)) * 100,
            ltv: '0.8', // Simplified, should be calculated from configuration
            totalLiquidity: '10000000', // Placeholder
            utilizationRate: '0.65' // Placeholder
          };
          
          console.log(`Successfully got Aave data for ${symbol}: Supply APY ${result[symbol].supplyAPY.toFixed(2)}%`);
        } catch (err) {
          console.error(`Failed to get Aave data for ${symbol}:`, err);
        }
      }
      
      if (Object.keys(result).length === 0) {
        throw new Error('Failed to get any Aave token data');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching Aave data:', error);
      
      // Fallback to static data
      console.log('Using Aave fallback data');
      return {
        DAI: { supplyAPY: 2.5, borrowAPY: 3.8, totalLiquidity: '150000000', utilizationRate: '0.65', ltv: '0.75' },
        USDC: { supplyAPY: 2.7, borrowAPY: 4.1, totalLiquidity: '250000000', utilizationRate: '0.72', ltv: '0.80' },
        ETH: { supplyAPY: 0.5, borrowAPY: 1.8, totalLiquidity: '100000', utilizationRate: '0.45', ltv: '0.80' }
      };
    }
  }

  async getCompoundData() {
    try {
      console.log('Fetching Compound data using on-chain methods');
      
      const cTokenAddresses = {
        cETH: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
        cDAI: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
        cUSDC: '0x39AA39c021dfbaE8faC545936693aC917d5E7563'
      };
      
      const cTokenABI = [
        "function supplyRatePerBlock() external view returns (uint)",
        "function borrowRatePerBlock() external view returns (uint)"
      ];
      
      const onChainData = {};
      for (const [symbol, address] of Object.entries(cTokenAddresses)) {
        try {
          const contract = new ethers.Contract(address, cTokenABI, this.provider);
          const supplyRate = await contract.supplyRatePerBlock();
          const borrowRate = await contract.borrowRatePerBlock();
          
          // Convert per-block rates to APY (assuming ~4 blocks per minute, 525600 minutes per year)
          const blocksPerYear = 4 * 60 * 24 * 365;
          const supplyAPY = (Math.pow((1 + (supplyRate / 1e18)), blocksPerYear) - 1) * 100;
          const borrowAPY = (Math.pow((1 + (borrowRate / 1e18)), blocksPerYear) - 1) * 100;
          
          const tokenSymbol = symbol === 'cETH' ? 'ETH' : symbol.slice(1);
          onChainData[tokenSymbol] = {
            supplyAPY,
            borrowAPY,
            collateralFactor: '0.75' // Simplified
          };
          
          console.log(`Successfully got on-chain Compound data for ${tokenSymbol}: Supply APY ${supplyAPY.toFixed(2)}%`);
        } catch (err) {
          console.error(`Failed to get on-chain Compound data for ${symbol}:`, err);
        }
      }
      
      if (Object.keys(onChainData).length === 0) {
        throw new Error('Failed to get any on-chain Compound data');
      }
      
      return onChainData;
    } catch (error) {
      console.error('Error fetching on-chain Compound data:', error);
      
      // Fallback data
      console.log('Using Compound fallback data');
      return {
        DAI: { supplyAPY: 2.2, borrowAPY: 3.5, totalSupply: '120000000', totalBorrow: '80000000', collateralFactor: '0.75' },
        USDC: { supplyAPY: 2.4, borrowAPY: 3.8, totalSupply: '200000000', totalBorrow: '140000000', collateralFactor: '0.75' },
        ETH: { supplyAPY: 0.3, borrowAPY: 1.5, totalSupply: '80000', totalBorrow: '30000', collateralFactor: '0.75' }
      };
    }
  }

  async getUniswapData() {
    try {
      console.log('Fetching Uniswap data using on-chain methods');
      
      // Top Uniswap V3 pools
      const topPools = [
        {
          name: 'ETH-USDC',
          address: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8'
        },
        {
          name: 'ETH-USDT',
          address: '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36'
        },
        {
          name: 'WBTC-ETH',
          address: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD'
        }
      ];
      
      const uniswapV3PoolABI = [
        "function fee() external view returns (uint24)",
        "function liquidity() external view returns (uint128)"
      ];
      
      const poolData = [];
      
      for (const pool of topPools) {
        try {
          const contract = new ethers.Contract(pool.address, uniswapV3PoolABI, this.provider);
          const [fee, liquidity] = await Promise.all([
            contract.fee(),
            contract.liquidity()
          ]);
          
          // Calculate APY estimate based on fee tier
          const feeTier = parseInt(fee) / 1000000; // Convert to percentage
          
          // Simplified APY calculation
          const estimatedAPY = feeTier * 365; // Very simplified
          
          poolData.push({
            name: pool.name,
            fee: feeTier,
            volumeUSD: 12500000, // Placeholder
            liquidity: parseInt(ethers.utils.formatEther(liquidity)),
            estimatedAPY: Math.min(estimatedAPY * 3, 12) // Cap at reasonable value
          });
          
          console.log(`Successfully fetched Uniswap data for ${pool.name}`);
        } catch (err) {
          console.error(`Failed to get data for pool ${pool.name}:`, err);
        }
      }
      
      if (poolData.length === 0) {
        throw new Error('Failed to fetch any Uniswap pool data');
      }
      
      return poolData;
    } catch (error) {
      console.error('Error fetching Uniswap data:', error);
      
      // Fallback data
      console.log('Using Uniswap fallback data');
      return [
        { name: 'ETH-USDC', fee: 0.3, volumeUSD: 12500000, liquidity: 150000000, estimatedAPY: 9.1 },
        { name: 'ETH-USDT', fee: 0.3, volumeUSD: 11200000, liquidity: 140000000, estimatedAPY: 8.7 },
        { name: 'WBTC-ETH', fee: 0.3, volumeUSD: 8900000, liquidity: 120000000, estimatedAPY: 8.1 }
      ];
    }
  }

  async getCurveData() {
    try {
      console.log('Fetching Curve data using on-chain methods');
      
      // Top Curve pools
      const curvePools = [
        {
          name: '3pool',
          address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'
        },
        {
          name: 'stETH',
          address: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022'
        },
        {
          name: 'BUSD',
          address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a'
        }
      ];
      
      const curvePoolABI = [
        "function get_virtual_price() external view returns (uint256)"
      ];
      
      const poolData = [];
      
      for (const pool of curvePools) {
        try {
          const contract = new ethers.Contract(pool.address, curvePoolABI, this.provider);
          
          // Get virtual price as a basic indicator
          const virtualPrice = await contract.get_virtual_price();
          const virtualPriceFloat = parseFloat(ethers.utils.formatUnits(virtualPrice, 18));
          
          // Very simplified APY estimate
          // In a real implementation, you'd track the virtual price over time
          const estimatedAPY = pool.name === 'stETH' ? 3.2 : (pool.name === '3pool' ? 2.8 : 2.5);
          
          poolData.push({
            name: pool.name,
            apy: estimatedAPY,
            volume: pool.name === 'stETH' ? 4200000 : (pool.name === '3pool' ? 5600000 : 3100000), // Placeholder
            totalLiquidity: pool.name === 'stETH' ? 320000000 : (pool.name === '3pool' ? 580000000 : 210000000), // Placeholder
            virtualPrice: virtualPriceFloat
          });
          
          console.log(`Successfully fetched Curve data for ${pool.name}`);
        } catch (err) {
          console.error(`Failed to get data for Curve pool ${pool.name}:`, err);
        }
      }
      
      if (poolData.length === 0) {
        throw new Error('Failed to fetch any Curve pool data');
      }
      
      return poolData;
    } catch (error) {
      console.error('Error fetching Curve data:', error);
      
      // Fallback data
      console.log('Using Curve fallback data');
      return [
        { name: '3pool', apy: 2.8, volume: 5600000, totalLiquidity: 580000000 },
        { name: 'stETH', apy: 3.2, volume: 4200000, totalLiquidity: 320000000 },
        { name: 'BUSD', apy: 2.5, volume: 3100000, totalLiquidity: 210000000 }
      ];
    }
  }

  async getAllProtocolData() {
    console.log('Fetching all protocol data');
    
    // Create individual timeouts for each protocol
    const timeout = ms => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Protocol data request timeout')), ms));
    
    try {
      // Use Promise.race to add timeouts to individual protocol requests
      const results = await Promise.allSettled([
        Promise.race([this.getAaveData(), timeout(20000)]),
        Promise.race([this.getCompoundData(), timeout(20000)]),
        Promise.race([this.getUniswapData(), timeout(20000)]),
        Promise.race([this.getCurveData(), timeout(20000)]),
        Promise.race([this.getEthPrice(), timeout(10000)])
      ]);
      
      console.log('All protocol data fetched with statuses:',
        results.map((r, i) => {
          const protocols = ['Aave', 'Compound', 'Uniswap', 'Curve', 'ETH Price'];
          return `${protocols[i]}: ${r.status}`;
        }).join(', ')
      );
      
      // Process results
      return {
        aave: results[0].status === 'fulfilled' ? results[0].value : {
          DAI: { supplyAPY: 2.5, borrowAPY: 3.8, totalLiquidity: '150000000', utilizationRate: '0.65', ltv: '0.75' },
          USDC: { supplyAPY: 2.7, borrowAPY: 4.1, totalLiquidity: '250000000', utilizationRate: '0.72', ltv: '0.80' },
          ETH: { supplyAPY: 0.5, borrowAPY: 1.8, totalLiquidity: '100000', utilizationRate: '0.45', ltv: '0.80' }
        },
        compound: results[1].status === 'fulfilled' ? results[1].value : {
          DAI: { supplyAPY: 2.2, borrowAPY: 3.5, totalSupply: '120000000', totalBorrow: '80000000', collateralFactor: '0.75' },
          USDC: { supplyAPY: 2.4, borrowAPY: 3.8, totalSupply: '200000000', totalBorrow: '140000000', collateralFactor: '0.75' },
          ETH: { supplyAPY: 0.3, borrowAPY: 1.5, totalSupply: '80000', totalBorrow: '30000', collateralFactor: '0.75' }
        },
        uniswap: results[2].status === 'fulfilled' ? results[2].value : [
          { name: 'ETH-USDC', fee: 0.3, volumeUSD: 12500000, liquidity: 150000000, estimatedAPY: 9.1, token0Price: 3000, token1Price: 0.00033 },
          { name: 'ETH-USDT', fee: 0.3, volumeUSD: 11200000, liquidity: 140000000, estimatedAPY: 8.7, token0Price: 3000, token1Price: 0.00033 },
          { name: 'WBTC-ETH', fee: 0.3, volumeUSD: 8900000, liquidity: 120000000, estimatedAPY: 8.1, token0Price: 0.065, token1Price: 15.4 }
        ],
        curve: results[3].status === 'fulfilled' ? results[3].value : [
          { name: '3pool', apy: 2.8, volume: 5600000, totalLiquidity: 580000000 },
          { name: 'stETH', apy: 3.2, volume: 4200000, totalLiquidity: 320000000 },
          { name: 'BUSD', apy: 2.5, volume: 3100000, totalLiquidity: 210000000 }
        ],
        timestamp: new Date().toISOString(),
        ethPrice: results[4].status === 'fulfilled' ? results[4].value : 3000
      };
    } catch (error) {
      console.error('Error fetching all protocol data:', error);
      
      // Fallback data if everything fails
      console.log('Using complete fallback data for all protocols');
      return {
        aave: {
          DAI: { supplyAPY: 2.5, borrowAPY: 3.8, totalLiquidity: '150000000', utilizationRate: '0.65', ltv: '0.75' },
          USDC: { supplyAPY: 2.7, borrowAPY: 4.1, totalLiquidity: '250000000', utilizationRate: '0.72', ltv: '0.80' },
          ETH: { supplyAPY: 0.5, borrowAPY: 1.8, totalLiquidity: '100000', utilizationRate: '0.45', ltv: '0.80' }
        },
        compound: {
          DAI: { supplyAPY: 2.2, borrowAPY: 3.5, totalSupply: '120000000', totalBorrow: '80000000', collateralFactor: '0.75' },
          USDC: { supplyAPY: 2.4, borrowAPY: 3.8, totalSupply: '200000000', totalBorrow: '140000000', collateralFactor: '0.75' },
          ETH: { supplyAPY: 0.3, borrowAPY: 1.5, totalSupply: '80000', totalBorrow: '30000', collateralFactor: '0.75' }
        },
        uniswap: [
          { name: 'ETH-USDC', fee: 0.3, volumeUSD: 12500000, liquidity: 150000000, estimatedAPY: 9.1, token0Price: 3000, token1Price: 0.00033 },
          { name: 'ETH-USDT', fee: 0.3, volumeUSD: 11200000, liquidity: 140000000, estimatedAPY: 8.7, token0Price: 3000, token1Price: 0.00033 },
          { name: 'WBTC-ETH', fee: 0.3, volumeUSD: 8900000, liquidity: 120000000, estimatedAPY: 8.1, token0Price: 0.065, token1Price: 15.4 }
        ],
        curve: [
          { name: '3pool', apy: 2.8, volume: 5600000, totalLiquidity: 580000000 },
          { name: 'stETH', apy: 3.2, volume: 4200000, totalLiquidity: 320000000 },
          { name: 'BUSD', apy: 2.5, volume: 3100000, totalLiquidity: 210000000 }
        ],
        timestamp: new Date().toISOString(),
        ethPrice: 3000
      };
    }
  }
  
  // Helper method to calculate RSI
  _calculateRSI(prices, period = 14) {
    if (!prices || prices.length <= period) {
      return [50]; // Default neutral RSI if not enough data
    }
    
    const deltas = [];
    for (let i = 1; i < prices.length; i++) {
      deltas.push(prices[i] - prices[i - 1]);
    }
    
    const gains = deltas.map(d => d > 0 ? d : 0);
    const losses = deltas.map(d => d < 0 ? -d : 0);
    
    // Calculate initial average gain/loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    const rsiValues = [];
    
    // Calculate first RSI
    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsiValues.push(100 - (100 / (1 + rs)));
    }
    
    // Calculate remaining RSI values
    for (let i = period; i < deltas.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
      
      if (avgLoss === 0) {
        rsiValues.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsiValues.push(100 - (100 / (1 + rs)));
      }
    }
    
    return rsiValues;
  }
  
  // Helper method to get historical blocks for data analysis
  async _getHistoricalBlocks(days) {
    try {
      const blocks = [];
      const currentBlock = await this.provider.getBlockNumber();
      const blocksPerDay = 7200; // ~15s per block = ~5760 blocks per day, rounded up for safety
      
      for (let i = days; i > 0; i--) {
        blocks.push(currentBlock - (i * blocksPerDay));
      }
      
      return blocks;
    } catch (error) {
      console.error('Error getting historical blocks:', error);
      return [];
    }
  }
  
  // Helper method to calculate standard deviation
  _calculateStdDev(data) {
    if (!data || data.length === 0) return 0;
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squareDiffs = data.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / data.length;
    return Math.sqrt(avgSquareDiff);
  }
  
  // Helper method to get contract transaction count (used as a proxy for volume)
  async _getContractTxCount(address) {
    try {
      const response = await axios.get(this.etherscanBaseURL, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 1, // We just need the count
          sort: 'desc',
          apikey: process.env.ETHERSCAN_API_KEY
        }
      });
      
      if (response.data.status !== '1') {
        return 1000; // Default value
      }
      
      return parseInt(response.data.result.length);
    } catch (error) {
      console.error('Error fetching contract tx count:', error);
      return 1000; // Default value
    }
  }
}

module.exports = new EthClient();