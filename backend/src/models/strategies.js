class Strategy {
    constructor(data) {
      this.name = data.name;
      this.description = data.description;
      this.expectedReturn = data.expectedReturn;
      this.riskLevel = data.riskLevel;
      this.protocols = data.protocols || [];
      this.assets = data.assets || [];
      this.marketConditions = data.marketConditions || [];
      this.steps = data.steps || [];
    }
    
    isCompatible(marketTrend, riskProfile) {
      // Check if strategy is compatible with current market conditions and risk profile
      if (this.marketConditions.length > 0 && !this.marketConditions.includes(marketTrend)) {
        return false;
      }
      
      const riskMapping = {
        'very low': 1,
        'low': 2,
        'medium-low': 3,
        'medium': 4,
        'medium-high': 5,
        'high': 6,
        'very high': 7
      };
      
      const strategyRisk = riskMapping[this.riskLevel.toLowerCase()] || 4;
      
      // Check if risk profile matches strategy risk
      switch(riskProfile) {
        case 'conservative':
          return strategyRisk <= 3;
        case 'moderate':
          return strategyRisk >= 2 && strategyRisk <= 5;
        case 'aggressive':
          return strategyRisk >= 4;
        default:
          return true;
      }
    }
  }
  
  // Predefined strategies
  const strategies = [
    new Strategy({
      name: "Stablecoin Lending",
      description: "Deposit stablecoins into lending protocols for steady yield",
      expectedReturn: "3-5% APY",
      riskLevel: "Low",
      protocols: ["Aave", "Compound"],
      assets: ["USDC", "DAI"],
      marketConditions: ["bearish", "neutral", "bullish"],
      steps: [
        "Convert a portion of your capital to stablecoins",
        "Deposit stablecoins into Aave or Compound",
        "Monitor interest rates and rebalance as needed"
      ]
    }),
    
    new Strategy({
      name: "ETH Staking",
      description: "Stake ETH for passive income",
      expectedReturn: "4-6% APY",
      riskLevel: "Medium-Low",
      protocols: ["Lido", "Rocket Pool"],
      assets: ["ETH"],
      marketConditions: ["bearish", "neutral", "bullish"],
      steps: [
        "Convert assets to ETH",
        "Stake ETH through a liquid staking provider",
        "Hold staked ETH tokens for yield"
      ]
    }),
    
    new Strategy({
      name: "Liquidity Provision",
      description: "Provide liquidity to DEX pairs for fees and incentives",
      expectedReturn: "8-15% APY",
      riskLevel: "Medium",
      protocols: ["Uniswap", "Curve"],
      assets: ["ETH", "USDC", "DAI"],
      marketConditions: ["neutral", "bullish"],
      steps: [
        "Select a stable pair (e.g., ETH-USDC)",
        "Provide liquidity on Uniswap or Curve",
        "Monitor impermanent loss and rebalance as needed"
      ]
    }),
    
    new Strategy({
      name: "Leveraged Yield Farming",
      description: "Use borrowed funds to amplify returns from yield farming",
      expectedReturn: "15-25% APY",
      riskLevel: "High",
      protocols: ["Aave", "Uniswap", "Compound"],
      assets: ["ETH", "USDC", "DAI"],
      marketConditions: ["bullish"],
      steps: [
        "Deposit ETH as collateral in Aave or Compound",
        "Borrow stablecoins at a safe loan-to-value ratio",
        "Use borrowed funds for liquidity provision or yield farming",
        "Monitor health factor and adjust positions as needed"
      ]
    }),
    
    new Strategy({
      name: "Diversified Stablecoin Yield",
      description: "Spread stablecoins across multiple protocols for optimal yields",
      expectedReturn: "5-8% APY",
      riskLevel: "Low",
      protocols: ["Aave", "Compound", "Curve"],
      assets: ["USDC", "DAI", "USDT"],
      marketConditions: ["bearish", "neutral"],
      steps: [
        "Distribute stablecoins across Aave, Compound, and Curve",
        "Monitor rates and rebalance to maximize yield",
        "Consider stablecoin-ETH LP positions for a portion of funds"
      ]
    }),
    
    new Strategy({
      name: "Dollar-Cost Averaging",
      description: "Gradually accumulate ETH with regular purchases",
      expectedReturn: "Variable (ETH price dependent)",
      riskLevel: "Medium",
      protocols: ["Uniswap", "1inch"],
      assets: ["ETH", "USDC"],
      marketConditions: ["bearish"],
      steps: [
        "Set aside a fixed amount of USDC weekly/monthly",
        "Convert to ETH at regular intervals",
        "Hold for long-term appreciation"
      ]
    })
  ];
  
  module.exports = {
    Strategy,
    strategies
  };