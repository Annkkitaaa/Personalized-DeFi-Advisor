// backend/src/ai/advisor.js
const groqClient = require('./groqClient');
const { createStrategyPrompt } = require('./prompts');
const ethClient = require('../blockchain/ethClient');
const contractInteraction = require('../blockchain/contractInteraction');
const calculator = require('../utils/calculator');
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
        marketTrend: marketTrendData,
        volatility: this._calculateVolatility(protocolData)
      };
      
      // Get best opportunities based on real protocol data
      const bestOpportunities = this._findBestRealOpportunities(protocolData, userProfile, marketData);
      
      // Generate personalized recommendations using real data
      const recommendations = this._generatePersonalizedRecommendations(
        userProfile, 
        marketData, 
        protocolData,
        bestOpportunities
      );
      
      // Format the advice response
      const adviceResponse = {
        summary: this._generateSummary(userProfile, marketData, recommendations),
        allocation: recommendations.assetAllocation,
        protocols: recommendations.protocols,
        steps: recommendations.implementationSteps,
        expectedReturns: recommendations.expectedReturns,
        risks: this._generateRiskFactors(userProfile, marketData, recommendations),
        marketInsights: {
          ethPrice: marketData.ethPrice,
          gasPrice: marketData.gasPrice,
          trend: marketData.marketTrend
        },
        topOpportunities: bestOpportunities.slice(0, 4),
        timestamp: new Date().toISOString()
      };
      
      return adviceResponse;
    } catch (error) {
      console.error('Error generating advice:', error);
      throw new Error('Failed to generate personalized DeFi advice: ' + error.message);
    }
  }
  
  _generateSummary(userProfile, marketData, recommendations) {
    const riskProfile = userProfile.getRiskProfile();
    const timeHorizon = userProfile.timeHorizon;
    const capitalAmount = userProfile.capital.toLocaleString();
    const marketTrend = marketData.marketTrend;
    
    let summary = `Based on your ${riskProfile} risk profile, ${timeHorizon}-month time horizon, and a capital of $${capitalAmount}, `;
    
    if (marketTrend === 'bullish') {
      summary += `I recommend a strategy that takes advantage of the current bullish market trend. `;
    } else if (marketTrend === 'bearish') {
      summary += `I recommend a more conservative approach given the current bearish market conditions. `;
    } else {
      summary += `I recommend a balanced approach in the current neutral market. `;
    }
    
    // Add allocation strategy
    const stablecoinAllocation = recommendations.assetAllocation['Stablecoins'] || 
                               recommendations.assetAllocation['stablecoins'] || "40";
    
    summary += `This strategy allocates ${stablecoinAllocation}% to stablecoins for capital preservation, `;
    summary += `while seeking higher yields through diversified DeFi strategies including liquidity provision and staking. `;
    
    if (riskProfile === 'aggressive') {
      summary += `The focus is on maximizing returns through higher-yield opportunities, accepting greater volatility.`;
    } else if (riskProfile === 'conservative') {
      summary += `The focus is on capital preservation while still generating yield from lower-risk DeFi protocols.`;
    } else {
      summary += `The strategy balances risk and reward across established DeFi protocols.`;
    }
    
    return summary;
  }
  
  _findBestRealOpportunities(protocolData, userProfile, marketData) {
    const opportunities = [];
    const riskProfile = userProfile.getRiskProfile();
    
    // Add Aave lending opportunities from real data
    if (protocolData.aave) {
      Object.entries(protocolData.aave).forEach(([token, data]) => {
        if (data.supplyAPY) {
          const riskScore = this._assessProtocolRisk('Aave', token, marketData);
          opportunities.push({
            protocol: 'Aave',
            asset: `${token} Lending`,
            apy: data.supplyAPY,
            risk: riskScore,
            type: 'lending',
            description: `Earn ${data.supplyAPY.toFixed(2)}% APY by lending ${token} on Aave`
          });
        }
      });
    }
    
    // Add Compound lending opportunities from real data
    if (protocolData.compound) {
      Object.entries(protocolData.compound).forEach(([token, data]) => {
        if (data.supplyAPY) {
          const riskScore = this._assessProtocolRisk('Compound', token, marketData);
          opportunities.push({
            protocol: 'Compound',
            asset: `${token} Lending`,
            apy: data.supplyAPY,
            risk: riskScore,
            type: 'lending',
            description: `Earn ${data.supplyAPY.toFixed(2)}% APY by lending ${token} on Compound`
          });
        }
      });
    }
    
    // Add Uniswap liquidity opportunities from real data
    if (protocolData.uniswap && Array.isArray(protocolData.uniswap)) {
      protocolData.uniswap.forEach(pool => {
        if (pool.name && pool.estimatedAPY) {
          const riskScore = this._assessProtocolRisk('Uniswap', pool.name, marketData);
          opportunities.push({
            protocol: 'Uniswap',
            asset: pool.name,
            apy: pool.estimatedAPY,
            risk: riskScore,
            type: 'liquidity',
            description: `Earn approximately ${pool.estimatedAPY.toFixed(2)}% APY by providing liquidity to ${pool.name} pool on Uniswap`
          });
        }
      });
    }
    
    // Add Curve liquidity opportunities from real data
    if (protocolData.curve && Array.isArray(protocolData.curve)) {
      protocolData.curve.forEach(pool => {
        if (pool.name && pool.apy) {
          const riskScore = this._assessProtocolRisk('Curve', pool.name, marketData);
          opportunities.push({
            protocol: 'Curve',
            asset: pool.name,
            apy: pool.apy,
            risk: riskScore,
            type: 'liquidity',
            description: `Earn approximately ${pool.apy.toFixed(2)}% APY by providing liquidity to ${pool.name} pool on Curve`
          });
        }
      });
    }
    
    // Add ETH staking
    opportunities.push({
      protocol: 'Staking',
      asset: 'ETH',
      apy: 4.5,
      risk: 3,
      type: 'staking',
      description: 'Earn approximately 4-6% APY by staking ETH'
    });
    
    // Sort by risk-adjusted return based on user profile
    return this._sortOpportunitiesByUserProfile(opportunities, riskProfile);
  }
  
  _sortOpportunitiesByUserProfile(opportunities, riskProfile) {
    // Make a copy to avoid modifying original
    const sortedOps = [...opportunities];
    
    if (riskProfile === 'conservative') {
      // Sort by lowest risk first, then APY
      sortedOps.sort((a, b) => {
        if (a.risk !== b.risk) return a.risk - b.risk;
        return b.apy - a.apy;
      });
    } else if (riskProfile === 'aggressive') {
      // Sort by highest APY first, but with some risk consideration
      sortedOps.sort((a, b) => {
        // Risk-adjusted return for aggressive profile
        const aScore = a.apy / (a.risk * 0.5);
        const bScore = b.apy / (b.risk * 0.5);
        return bScore - aScore;
      });
    } else {
      // Moderate - balance risk and return
      sortedOps.sort((a, b) => {
        // Risk-adjusted return for moderate profile
        const aScore = a.apy / a.risk;
        const bScore = b.apy / b.risk;
        return bScore - aScore;
      });
    }
    
    return sortedOps;
  }
  
  _assessProtocolRisk(protocol, asset, marketData) {
    // Base risk by protocol
    const baseProtocolRisk = {
      'Aave': 3,
      'Compound': 3,
      'Uniswap': 6,
      'Curve': 5,
      'Staking': 2
    }[protocol] || 5;
    
    // Asset risk
    let assetRisk = 0;
    if (typeof asset === 'string') {
      if (asset.includes('USDC') || asset.includes('DAI') || asset.includes('USDT')) {
        assetRisk = 2;
      } else if (asset.includes('ETH') || asset.includes('ETH-')) {
        assetRisk = 4;
      } else if (asset.includes('BTC') || asset.includes('BTC-')) {
        assetRisk = 5;
      } else {
        assetRisk = 6; // Other assets/altcoins
      }
    }
    
    // Adjust risk based on market trend
    let marketRiskAdjustment = 0;
    if (marketData.marketTrend === 'bearish') {
      marketRiskAdjustment = 1; // Higher risk in bear market
    } else if (marketData.marketTrend === 'bullish') {
      marketRiskAdjustment = -0.5; // Lower risk in bull market
    }
    
    // For liquidity pools, add impermanent loss risk
    const impermanentLossRisk = (protocol === 'Uniswap' || protocol === 'Curve') ? 2 : 0;
    
    // Calculate final risk score (1-10 scale)
    const riskScore = Math.max(1, Math.min(10, 
      Math.round((baseProtocolRisk + assetRisk + marketRiskAdjustment + impermanentLossRisk) / 2)
    ));
    
    return riskScore;
  }
  
  _calculateVolatility(protocolData) {
    // Simplified estimate of market volatility based on market data
    // In a real implementation, this would use historical price data
    return 25; // Percentage volatility estimate
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
    
    // Analyze transaction history
    for (const tx of transactions) {
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
      
      if (tx.gasUsed && tx.gasPrice) {
        const gasEth = (parseInt(tx.gasUsed) * parseInt(tx.gasPrice)) / 10**18;
        analysis.gasSpent += gasEth;
      }
    }
    
    // Build a summary
    return `${analysis.totalTransactions} transactions found. User has interacted with ${analysis.protocols.size} different DeFi protocols.`;
  }
  
  _generatePersonalizedRecommendations(userProfile, marketData, protocolData, bestOpportunities) {
    const riskProfile = userProfile.getRiskProfile();
    const capital = userProfile.capital;
    const timeHorizon = userProfile.timeHorizon;
    
    // Generate asset allocation based on risk profile and market conditions
    const assetAllocation = this._generateAssetAllocation(riskProfile, marketData.marketTrend);
    
    // Generate protocol recommendations using the best real opportunities
    const protocols = this._generateProtocolRecommendations(bestOpportunities, riskProfile);
    
    // Generate implementation steps specific to the user's capital
    const implementationSteps = this._generateImplementationSteps(capital, assetAllocation, bestOpportunities);
    
    // Calculate expected returns based on asset allocation and opportunities
    const expectedReturns = this._calculateExpectedReturns(assetAllocation, bestOpportunities, timeHorizon);
    
    return {
      assetAllocation,
      protocols,
      implementationSteps,
      expectedReturns
    };
  }
  
  _generateAssetAllocation(riskProfile, marketTrend) {
    // Base allocation percentages by risk profile
    let allocation;
    
    if (riskProfile === 'conservative') {
      allocation = {
        'Stablecoins': 70,
        'Ethereum': 20,
        'Altcoins': 0,
        'USDC Liquidity Pool': 7,
        'Curve StETH Liquidity Pool': 3,
        'Staking ETH': 4
      };
    } else if (riskProfile === 'aggressive') {
      allocation = {
        'Stablecoins': 25,
        'Ethereum': 45,
        'Altcoins': 20,
        'USDC Liquidity Pool': 9,
        'Curve StETH Liquidity Pool': 3,
        'Staking ETH': 5
      };
    } else { // moderate
      allocation = {
        'Stablecoins': 45,
        'Ethereum': 30,
        'Altcoins': 10,
        'USDC Liquidity Pool': 8,
        'Curve StETH Liquidity Pool': 2,
        'Staking ETH': 5
      };
    }
    
    // Adjust based on market trend
    if (marketTrend === 'bullish') {
      // In a bull market, shift some allocation from stablecoins to ETH
      allocation['Ethereum'] += 10;
      allocation['Stablecoins'] -= 10;
      allocation['USDC Liquidity Pool'] += 2;
      allocation['Stablecoins'] -= 2;
    } else if (marketTrend === 'bearish') {
      // In a bear market, shift allocation from ETH to stablecoins
      allocation['Ethereum'] -= 10;
      allocation['Stablecoins'] += 10;
      allocation['Altcoins'] -= 5;
      allocation['Stablecoins'] += 5;
    }
    
    // Ensure no negative values
    Object.keys(allocation).forEach(key => {
      allocation[key] = Math.max(0, allocation[key]);
    });
    
    return allocation;
  }
  
  _generateProtocolRecommendations(opportunities, riskProfile) {
    // Get top opportunities based on risk profile
    // Conservative: 3-5 lowest risk opportunities
    // Moderate: 3-5 balanced opportunities
    // Aggressive: 3-5 highest APY opportunities
    
    const topCount = riskProfile === 'aggressive' ? 5 : (riskProfile === 'conservative' ? 3 : 4);
    
    // Get unique protocols from top opportunities
    const topOpportunities = opportunities.slice(0, Math.min(topCount + 3, opportunities.length));
    const uniqueProtocols = new Set();
    
    // Create numbered protocol recommendations
    const protocolRecs = [];
    let counter = 1;
    
    topOpportunities.forEach(opp => {
      const protocolKey = `${opp.protocol}:${opp.asset}`;
      if (!uniqueProtocols.has(protocolKey) && protocolRecs.length < topCount) {
        uniqueProtocols.add(protocolKey);
        
        // Format protocol recommendation
        let rec;
        if (opp.type === 'lending') {
          rec = `${counter}.${opp.protocol} ${opp.asset}`;
        } else if (opp.type === 'liquidity') {
          rec = `${counter}.${opp.protocol} Liquidity Provisioning (${opp.asset})`;
        } else if (opp.type === 'staking') {
          rec = `${counter}.Staking ${opp.asset}`;
        } else {
          rec = `${counter}.${opp.protocol} ${opp.asset}`;
        }
        
        protocolRecs.push(rec);
        counter++;
      }
    });
    
    return protocolRecs;
  }
  
  _generateImplementationSteps(capital, allocation, opportunities) {
    // Calculate dollar amounts for each allocation
    const stablecoinAmount = Math.round((allocation['Stablecoins'] / 100) * capital);
    const ethAmount = Math.round(((allocation['Ethereum'] || 0) / 100) * capital);
    
    // Calculate liquidity and staking amounts
    const usdcLpAmount = Math.round(((allocation['USDC Liquidity Pool'] || 0) / 100) * capital);
    const curveLpAmount = Math.round(((allocation['Curve StETH Liquidity Pool'] || 0) / 100) * capital);
    const stakingAmount = Math.round(((allocation['Staking ETH'] || 0) / 100) * capital);
    
    // Generate step-by-step implementation instructions
    const steps = [];
    
    // Add stablecoin step if allocation > 0
    if (stablecoinAmount > 0) {
      // Find best stablecoin lending opportunity
      const stablecoinOpp = opportunities.find(o => 
        (o.asset.includes('USDC') || o.asset.includes('DAI')) && o.type === 'lending'
      );
      
      if (stablecoinOpp) {
        steps.push(`1.Deposit ${stablecoinAmount.toLocaleString()} USD into ${stablecoinOpp.asset.split(' ')[0]} on ${stablecoinOpp.protocol} to earn approximately ${stablecoinOpp.apy.toFixed(2)}% APY.`);
      } else {
        steps.push(`1.Deposit ${stablecoinAmount.toLocaleString()} USD into a stablecoin (e.g., USDC or DAI) on a lending protocol like AAVE or Compound.`);
      }
    }
    
    // Add ETH transfer step if needed
    const remainingEthAmount = ethAmount + usdcLpAmount + curveLpAmount + stakingAmount;
    if (remainingEthAmount > 0) {
      steps.push(`2.Transfer ${remainingEthAmount.toLocaleString()} USD worth of Ethereum to a wallet.`);
    }
    
    // Add USDC Liquidity pool step
    if (usdcLpAmount > 0) {
      const uniOpp = opportunities.find(o => o.protocol === 'Uniswap' && o.asset.includes('ETH-USDC'));
      if (uniOpp) {
        steps.push(`3.Allocate ${usdcLpAmount.toLocaleString()} USD worth of Ethereum to Uniswap's ETH-USDC liquidity pool for an estimated ${uniOpp.apy.toFixed(2)}% APY.`);
      } else {
        steps.push(`3.Allocate ${usdcLpAmount.toLocaleString()} USD worth of Ethereum to Uniswap's ETH-USDC liquidity pool.`);
      }
    }
    
    // Add Curve liquidity pool step
    if (curveLpAmount > 0) {
      const curveOpp = opportunities.find(o => o.protocol === 'Curve' && o.asset.includes('stETH'));
      if (curveOpp) {
        steps.push(`4.Allocate ${curveLpAmount.toLocaleString()} USD worth of Ethereum to Curve's stETH liquidity pool for an estimated ${curveOpp.apy.toFixed(2)}% APY.`);
      } else {
        steps.push(`4.Allocate ${curveLpAmount.toLocaleString()} USD worth of Ethereum to Curve's stETH liquidity pool.`);
      }
    }
    
    // Add staking step
    if (stakingAmount > 0) {
      steps.push(`5.Stake the remaining ${stakingAmount.toLocaleString()} USD worth of Ethereum on a staking platform for 4-6% APY.`);
    }
    
    return steps;
  }
  
  _calculateExpectedReturns(allocation, opportunities, timeHorizonMonths) {
    // Calculate expected returns based on allocation percentages and opportunity APYs
    let weightedReturnMin = 0;
    let weightedReturnMax = 0;
    
    // Map allocation keys to opportunity types
    const allocationMap = {
      'Stablecoins': { type: 'lending', keywords: ['USDC', 'DAI', 'USDT'] },
      'USDC Liquidity Pool': { type: 'liquidity', keywords: ['USDC', 'ETH-USDC'] },
      'Curve StETH Liquidity Pool': { type: 'liquidity', keywords: ['stETH'] },
      'Staking ETH': { type: 'staking', keywords: ['ETH'] },
      'Ethereum': { type: 'hodl', keywords: ['ETH'] },
      'Altcoins': { type: 'hodl', keywords: ['altcoin'] }
    };
    
    // Calculate weighted returns
    Object.entries(allocation).forEach(([allocKey, percentage]) => {
      if (allocationMap[allocKey]) {
        const map = allocationMap[allocKey];
        
        // Find matching opportunity
        const matchingOpp = opportunities.find(o => 
          o.type === map.type && map.keywords.some(kw => o.asset.includes(kw))
        );
        
        // Default values if no matching opportunity
        let returnMin = 0;
        let returnMax = 0;
        
        if (matchingOpp) {
          // Use the APY from the matching opportunity with some variability
          returnMin = Math.max(0, matchingOpp.apy * 0.8);
          returnMax = matchingOpp.apy * 1.2;
        } else if (map.type === 'hodl') {
          // For hodl (Ethereum/altcoins), use different returns based on asset
          if (allocKey === 'Ethereum') {
            returnMin = 5;
            returnMax = 20;
          } else if (allocKey === 'Altcoins') {
            returnMin = 0;
            returnMax = 30;
          }
        } else if (map.type === 'staking') {
          returnMin = 4;
          returnMax = 6;
        } else if (map.type === 'lending') {
          returnMin = 2;
          returnMax = 5;
        } else if (map.type === 'liquidity') {
          returnMin = 3;
          returnMax = 10;
        }
        
        // Add weighted return to total
        weightedReturnMin += (percentage / 100) * returnMin;
        weightedReturnMax += (percentage / 100) * returnMax;
      }
    });
    
    // Round to 1 decimal place
    weightedReturnMin = Math.round(weightedReturnMin * 10) / 10;
    weightedReturnMax = Math.round(weightedReturnMax * 10) / 10;
    
    return {
      min: weightedReturnMin,
      max: weightedReturnMax,
      timeframe: `${timeHorizonMonths} months`
    };
  }
  
  _generateRiskFactors(userProfile, marketData, recommendations) {
    const riskProfile = userProfile.getRiskProfile();
    const marketTrend = marketData.marketTrend;
    
    // Common risks for all profiles
    const commonRisks = [
      "Smart contract risk associated with protocol interactions",
      "Regulatory changes could impact DeFi platforms and strategies"
    ];
    
    // Specific risks based on allocation and market conditions
    const specificRisks = [];
    
    // Market trend-specific risks
    if (marketTrend === 'bearish') {
      specificRisks.push("Market volatility risk with potential for further ETH price declines");
    } else if (marketTrend === 'bullish') {
      specificRisks.push("Risk of market correction after extended bullish trend");
    } else {
      specificRisks.push("Market volatility may affect ETH price and impact overall returns");
    }
    
    // Allocation-specific risks
    if (recommendations.assetAllocation['USDC Liquidity Pool'] > 0 || 
        recommendations.assetAllocation['Curve StETH Liquidity Pool'] > 0) {
      specificRisks.push("Impermanent loss risk when providing liquidity in volatile markets");
    }
    
    if (recommendations.assetAllocation['Ethereum'] > 30) {
      specificRisks.push("Higher exposure to ETH price volatility due to allocation percentage");
    }
    
    if (recommendations.assetAllocation['Altcoins'] > 0) {
      specificRisks.push("Altcoin investments carry higher volatility and potential for significant drawdowns");
    }
    
    if (recommendations.assetAllocation['Staking ETH'] > 0) {
      specificRisks.push("Staked ETH may have lock-up periods limiting liquidity");
    }
    
    // Add or remove risks based on risk profile
    if (riskProfile === 'conservative') {
      // For conservative profiles, add more caution about even small risks
      specificRisks.push("Even modest allocation to volatile assets could experience temporary drawdowns");
    } else if (riskProfile === 'aggressive') {
      // For aggressive profiles, add risk about concentration
      specificRisks.push("Higher allocation to growth assets increases portfolio volatility");
    }
    
    // Combine risks, ensure no duplicates
    const allRisks = [...commonRisks];
    specificRisks.forEach(risk => {
      if (!allRisks.includes(risk)) {
        allRisks.push(risk);
      }
    });
    
    return allRisks;
  }
}

module.exports = new DefiAdvisor();