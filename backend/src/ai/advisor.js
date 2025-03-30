const grokClient = require('./grokClient');
const { createStrategyPrompt } = require('./prompts');
const ethClient = require('../blockchain/ethClient');
const { formatStrategyResponse } = require('../utils/formatter');

class DefiAdvisor {
  async generatePersonalizedAdvice(userProfile, walletAddress) {
    try {
      // Fetch real-time blockchain data
      const ethPrice = await ethClient.getEthPrice();
      const gasPrice = await ethClient.getGasPrice();
      const protocolData = await ethClient.getAllProtocolData();
      const marketTrendData = await ethClient.getMarketTrend();
      
      // Wallet analysis
      let walletData = { history: null, balances: null, analysis: null };
      if (walletAddress) {
        const history = await ethClient.getWalletHistory(walletAddress);
        walletData = {
          history,
          analysis: this._analyzeWalletActivity(history)
        };
      }
      
      // Market data preparation
      const marketData = {
        ethPrice,
        gasPrice,
        marketTrend: marketTrendData.trend,
        volatility: marketTrendData.volatility,
        priceChange1d: marketTrendData.priceChange1d,
        priceChange7d: marketTrendData.priceChange7d,
        priceChange30d: marketTrendData.priceChange30d,
        rsi: marketTrendData.rsi
      };
      
      // Protocol data analysis
      const onChainData = {
        protocolAPYs: this._extractAPYs(protocolData),
        liquidityData: this._extractLiquidity(protocolData),
        bestOpportunities: this._findBestOpportunities(protocolData, userProfile),
        userActivity: walletData.analysis
      };
      
      // Risk-adjusted recommendations
      const recommendations = this._generateInitialRecommendations(
        userProfile, 
        marketData, 
        onChainData
      );
      
      // Generate prompt for AI with all real data
      const prompt = createStrategyPrompt(
        userProfile, 
        marketData, 
        onChainData,
        recommendations
      );
      
      // Get advice from AI
      const rawAdvice = await grokClient.generateAdvice(prompt);
      
      // Format and structure the response
      return formatStrategyResponse(rawAdvice, {
        marketData,
        protocolData: onChainData,
        recommendations,
        timestamp: new Date().toISOString(),
        userProfile: userProfile.getRiskProfile()
      });
    } catch (error) {
      console.error('Error generating advice:', error);
      throw new Error('Failed to generate personalized DeFi advice: ' + error.message);
    }
  }
  
  _extractAPYs(protocolData) {
    const apys = {
      lending: {},
      liquidity: {}
    };
    
    // Extract Aave lending rates
    if (protocolData.aave) {
      apys.lending.aave = {};
      for (const [token, data] of Object.entries(protocolData.aave)) {
        apys.lending.aave[token] = {
          supply: data.supplyAPY,
          borrow: data.borrowAPY,
          ltv: data.ltv
        };
      }
    }
    
    // Extract Compound lending rates
    if (protocolData.compound) {
      apys.lending.compound = {};
      for (const [token, data] of Object.entries(protocolData.compound)) {
        apys.lending.compound[token] = {
          supply: data.supplyAPY,
          borrow: data.borrowAPY,
          collateralFactor: data.collateralFactor
        };
      }
    }
    
    // Extract Curve pool APYs
    if (protocolData.curve) {
      apys.liquidity.curve = protocolData.curve.map(pool => ({
        name: pool.name,
        apy: pool.apy
      }));
    }
    
    // Extract Uniswap pool APYs
    if (protocolData.uniswap) {
      apys.liquidity.uniswap = protocolData.uniswap.map(pool => ({
        name: pool.name,
        apy: pool.estimatedAPY,
        fee: pool.fee
      }));
    }
    
    return apys;
  }
  
  _extractLiquidity(protocolData) {
    const liquidity = {};
    
    // Extract Uniswap liquidity
    if (protocolData.uniswap) {
      liquidity.uniswap = protocolData.uniswap.map(pool => ({
        name: pool.name,
        volumeUSD: pool.volumeUSD,
        liquidity: pool.liquidity
      }));
    }
    
    // Extract Curve liquidity
    if (protocolData.curve) {
      liquidity.curve = protocolData.curve.map(pool => ({
        name: pool.name,
        volume: pool.volume,
        totalLiquidity: pool.totalLiquidity
      }));
    }
    
    return liquidity;
  }
  
  _analyzeWalletActivity(transactions) {
    if (!transactions || transactions.length === 0) {
      return "No transaction history available";
    }
    
    // Count transaction types and patterns
    const analysis = {
      totalTransactions: transactions.length,
      contractInteractions: 0,
      defiInteractions: {
        aave: 0,
        compound: 0,
        uniswap: 0,
        curve: 0,
        other: 0
      },
      gasSpent: 0,
      protocols: new Set()
    };
    
    // Analyze each transaction
    for (const tx of transactions) {
      // Count contract interactions
      if (tx.input && tx.input !== '0x') {
        analysis.contractInteractions++;
        
        if (tx.protocol && tx.protocol !== 'Unknown') {
          analysis.protocols.add(tx.protocol);
          
          if (analysis.defiInteractions[tx.protocol.toLowerCase()]) {
            analysis.defiInteractions[tx.protocol.toLowerCase()]++;
          } else {
            analysis.defiInteractions.other++;
          }
        }
      }
      
      // Calculate gas spent
      if (tx.gasUsed && tx.gasPrice) {
        const gasEth = (parseInt(tx.gasUsed) * parseInt(tx.gasPrice)) / 10**18;
        analysis.gasSpent += gasEth;
      }
    }
    
    // Build a summary
    let summary = `${analysis.totalTransactions} transactions found. `;
    
    if (analysis.contractInteractions > 0) {
      summary += `${analysis.contractInteractions} contract interactions including: `;
      
      const defiSummary = Object.entries(analysis.defiInteractions)
        .filter(([_, count]) => count > 0)
        .map(([protocol, count]) => `${count} with ${protocol}`)
        .join(', ');
      
      summary += defiSummary || "none with known DeFi protocols";
    }
    
    summary += `. Approximately ${analysis.gasSpent.toFixed(4)} ETH spent on gas.`;
    
    if (analysis.protocols.size > 0) {
      summary += ` User has interacted with the following protocols: ${Array.from(analysis.protocols).join(', ')}.`;
    }
    
    return summary;
  }
  
  _findBestOpportunities(protocolData, userProfile) {
    const opportunities = [];
    const riskProfile = userProfile.getRiskProfile();
    
    // Find best lending opportunities
    if (protocolData.aave) {
      for (const [token, data] of Object.entries(protocolData.aave)) {
        const riskScore = this._assessLendingRisk('aave', token);
        opportunities.push({
          type: 'lending',
          protocol: 'Aave',
          asset: token,
          apy: data.supplyAPY,
          risk: riskScore,
          suitable: this._isSuitableForRiskProfile(riskScore, riskProfile)
        });
      }
    }
    
    if (protocolData.compound) {
      for (const [token, data] of Object.entries(protocolData.compound)) {
        const riskScore = this._assessLendingRisk('compound', token);
        opportunities.push({
          type: 'lending',
          protocol: 'Compound',
          asset: token,
          apy: data.supplyAPY,
          risk: riskScore,
          suitable: this._isSuitableForRiskProfile(riskScore, riskProfile)
        });
      }
    }
    
    // Find best liquidity opportunities
    if (protocolData.uniswap) {
      for (const pool of protocolData.uniswap) {
        const riskScore = this._assessLiquidityRisk('uniswap', pool.name);
        opportunities.push({
          type: 'liquidity',
          protocol: 'Uniswap',
          asset: pool.name,
          apy: pool.estimatedAPY,
          risk: riskScore,
          suitable: this._isSuitableForRiskProfile(riskScore, riskProfile)
        });
      }
    }
    
    if (protocolData.curve) {
      for (const pool of protocolData.curve) {
        const riskScore = this._assessLiquidityRisk('curve', pool.name);
        opportunities.push({
          type: 'liquidity',
          protocol: 'Curve',
          asset: pool.name,
          apy: pool.apy,
          risk: riskScore,
          suitable: this._isSuitableForRiskProfile(riskScore, riskProfile)
        });
      }
    }
    
    // Sort by APY and filter for risk suitability
    const filtered = opportunities
      .filter(opp => opp.suitable)
      .sort((a, b) => b.apy - a.apy);
    
    return filtered.slice(0, 5); // Top 5 opportunities
  }
  
  _assessLendingRisk(protocol, token) {
    // Risk assessment based on protocol and token
    const baseRisk = {
      'aave': 3,
      'compound': 4
    }[protocol.toLowerCase()] || 5;
    
    const tokenRisk = {
      'DAI': 2,
      'USDC': 2,
      'USDT': 3,
      'ETH': 5,
      'WETH': 5,
      'WBTC': 6
    }[token] || 7;
    
    return Math.min(10, Math.max(1, Math.floor((baseRisk + tokenRisk) / 2)));
  }
  
  _assessLiquidityRisk(protocol, poolName) {
    // Risk assessment for liquidity pools
    const baseRisk = {
      'uniswap': 6,
      'curve': 5
    }[protocol.toLowerCase()] || 7;
    
    // Assess by tokens in pool
    let tokenRisk = 5;
    if (poolName.includes('ETH') && poolName.includes('USDC')) {
      tokenRisk = 6;
    } else if (poolName.includes('USDC') && poolName.includes('USDT')) {
      tokenRisk = 4;
    } else if (poolName.includes('stETH')) {
      tokenRisk = 7;
    }
    
    return Math.min(10, Math.max(1, Math.floor((baseRisk + tokenRisk) / 2)));
  }
  
  _isSuitableForRiskProfile(riskScore, profileType) {
    switch (profileType.toLowerCase()) {
      case 'conservative':
        return riskScore <= 4;
      case 'moderate':
        return riskScore >= 3 && riskScore <= 7;
      case 'aggressive':
        return riskScore >= 5;
      default:
        return true;
    }
  }
  
  _generateInitialRecommendations(userProfile, marketData, onChainData) {
    const recommendations = {
      assetAllocation: {},
      protocols: [],
      strategies: []
    };
    
    const riskProfile = userProfile.getRiskProfile();
    const timeHorizon = userProfile.timeHorizon;
    
    // Asset allocation based on risk profile and market trend
    switch (riskProfile) {
      case 'conservative':
        recommendations.assetAllocation = {
          stablecoins: "70-80%",
          ethereum: "10-20%",
          altcoins: "0-10%"
        };
        break;
      case 'moderate':
        recommendations.assetAllocation = {
          stablecoins: "40-60%",
          ethereum: "30-40%",
          altcoins: "10-20%"
        };
        break;
      case 'aggressive':
        recommendations.assetAllocation = {
          stablecoins: "20-30%",
          ethereum: "40-50%",
          altcoins: "30-40%"
        };
        break;
    }
    
    // Adjust for market trend
    if (marketData.marketTrend === 'bullish') {
      // Increase crypto allocation in bull market
      switch (riskProfile) {
        case 'conservative':
          recommendations.assetAllocation.ethereum = "15-25%";
          recommendations.assetAllocation.stablecoins = "65-75%";
          break;
        case 'moderate':
          recommendations.assetAllocation.ethereum = "35-45%";
          recommendations.assetAllocation.stablecoins = "35-55%";
          break;
        case 'aggressive':
          recommendations.assetAllocation.ethereum = "45-55%";
          recommendations.assetAllocation.stablecoins = "15-25%";
          break;
      }
    } else if (marketData.marketTrend === 'bearish') {
      // Increase stablecoin allocation in bear market
      switch (riskProfile) {
        case 'conservative':
          recommendations.assetAllocation.ethereum = "5-15%";
          recommendations.assetAllocation.stablecoins = "75-85%";
          break;
        case 'moderate':
          recommendations.assetAllocation.ethereum = "25-35%";
          recommendations.assetAllocation.stablecoins = "55-65%";
          break;
        case 'aggressive':
          recommendations.assetAllocation.ethereum = "35-45%";
          recommendations.assetAllocation.stablecoins = "25-35%";
          break;
      }
    }
    
    // Recommended protocols based on best opportunities
    const suitableOpportunities = onChainData.bestOpportunities || [];
    
    for (const opportunity of suitableOpportunities) {
      if (!recommendations.protocols.includes(opportunity.protocol)) {
        recommendations.protocols.push(opportunity.protocol);
      }
    }
    
    // Strategy recommendations
    if (marketData.marketTrend === 'bullish') {
      if (riskProfile === 'aggressive') {
        recommendations.strategies.push({
          name: "Leveraged Yield Farming",
          description: "Borrow stablecoins against ETH collateral to increase liquidity provision returns",
          expectedReturn: "15-25% APY",
          riskLevel: "High"
        });
      }
      
      if (riskProfile === 'moderate' || riskProfile === 'aggressive') {
        recommendations.strategies.push({
          name: "Token Pairs Liquidity",
          description: "Provide liquidity to ETH-stablecoin pairs on Uniswap",
          expectedReturn: "10-20% APY",
          riskLevel: "Medium"
        });
      }
    }
    
    if (riskProfile === 'conservative' || marketData.marketTrend === 'bearish') {
      recommendations.strategies.push({
        name: "Stablecoin Lending",
        description: "Deposit stablecoins into Aave or Compound for steady yields",
        expectedReturn: "3-5% APY",
        riskLevel: "Low"
      });
    }
    
    if (timeHorizon > 6) {
      recommendations.strategies.push({
        name: "Staking ETH",
        description: "Stake ETH for steady passive income",
        expectedReturn: "4-6% APY",
        riskLevel: "Medium-Low"
      });
    }
    
    return recommendations;
  }
}

module.exports = new DefiAdvisor();