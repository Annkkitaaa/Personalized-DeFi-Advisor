// backend/src/ai/prompts.js
const createStrategyPrompt = (userData, marketData, onChainData, recommendations) => {
  return `
As a DeFi advisor, suggest optimal strategies based on the following real blockchain and market data:

## User Profile
- Risk tolerance: ${userData.riskTolerance} (1-10)
- Investment horizon: ${userData.timeHorizon} months
- Capital available: ${userData.capital} USD
- Previous DeFi experience: ${userData.experience}
- Risk profile assessment: ${userData.getRiskProfile()}

## Current Market Conditions
- ETH price: ${marketData.ethPrice} USD
- Market trend: ${marketData.marketTrend}
- Market volatility: ${marketData.volatility || 'N/A'}% 
- 1-day price change: ${marketData.priceChange1d || 'N/A'}%
- 7-day price change: ${marketData.priceChange7d || 'N/A'}%
- 30-day price change: ${marketData.priceChange30d || 'N/A'}%
- Gas prices: ${marketData.gasPrice} gwei
- RSI: ${marketData.rsi || 'N/A'}

## DeFi Protocol Data
### Lending Rates (APY)
${formatLendingRates(onChainData.protocolAPYs.lending)}

### Liquidity Pools (APY)
${formatLiquidityRates(onChainData.protocolAPYs.liquidity)}

### Top Opportunities Based on Risk Profile
${formatOpportunities(onChainData.bestOpportunities)}

### User Wallet Activity
${onChainData.userActivity || 'No wallet data provided'}

## Initial Recommendations
### Asset Allocation
${formatAssetAllocation(recommendations.assetAllocation)}

### Recommended Protocols
${recommendations.protocols.join(', ')}

### Strategy Ideas
${formatStrategies(recommendations.strategies)}

Based on this comprehensive real-time data, provide a personalized DeFi strategy recommendation including:

1. Precise asset allocation with percentages
2. Specific DeFi protocols to use with detailed rationale
3. Step-by-step implementation instructions
4. Expected returns with timeframes
5. Risk mitigation strategies
6. Gas optimization recommendations

Focus on actionable advice that balances risk and reward according to the user's profile.
Don't reference information outside what is provided above. Use only the real market data provided here.
`;
};

// Helper formatting functions
const formatLendingRates = (lendingRates) => {
  if (!lendingRates) return 'No lending rate data available';
  
  let result = '';
  
  if (lendingRates.aave) {
    result += 'AAVE:\n';
    for (const [token, rates] of Object.entries(lendingRates.aave)) {
      result += `- ${token}: Supply ${rates.supply.toFixed(2)}%, Borrow ${rates.borrow.toFixed(2)}%\n`;
    }
  }
  
  if (lendingRates.compound) {
    result += 'Compound:\n';
    for (const [token, rates] of Object.entries(lendingRates.compound)) {
      result += `- ${token}: Supply ${rates.supply.toFixed(2)}%, Borrow ${rates.borrow.toFixed(2)}%\n`;
    }
  }
  
  return result;
};

const formatLiquidityRates = (liquidityRates) => {
  if (!liquidityRates) return 'No liquidity pool data available';
  
  let result = '';
  
  if (liquidityRates.uniswap) {
    result += 'Uniswap:\n';
    for (const pool of liquidityRates.uniswap) {
      result += `- ${pool.name}: ${pool.apy.toFixed(2)}% (Fee: ${pool.fee}%)\n`;
    }
  }
  
  if (liquidityRates.curve) {
    result += 'Curve:\n';
    for (const pool of liquidityRates.curve) {
      result += `- ${pool.name}: ${pool.apy.toFixed(2)}%\n`;
    }
  }
  
  return result;
};

const formatOpportunities = (opportunities) => {
  if (!opportunities || opportunities.length === 0) return 'No suitable opportunities found';
  
  let result = '';
  for (const opp of opportunities) {
    result += `- ${opp.protocol} ${opp.type} (${opp.asset}): ${opp.apy.toFixed(2)}% APY [Risk: ${opp.risk}/10]\n`;
  }
  
  return result;
};

const formatAssetAllocation = (allocation) => {
  if (!allocation) return 'No allocation data available';
  
  let result = '';
  for (const [asset, percentage] of Object.entries(allocation)) {
    result += `- ${asset}: ${percentage}\n`;
  }
  
  return result;
};

const formatStrategies = (strategies) => {
  if (!strategies || strategies.length === 0) return 'No strategies available';
  
  let result = '';
  for (const strategy of strategies) {
    result += `- ${strategy.name}: ${strategy.description}. Expected: ${strategy.expectedReturn} [Risk: ${strategy.riskLevel}]\n`;
  }
  
  return result;
};

module.exports = {
  createStrategyPrompt
};