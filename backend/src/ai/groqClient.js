// Save this as: D:\projects\Personalized-DeFi-Advisor\backend\src\ai\groqClient.js
const axios = require('axios');

class GroqClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  async generateAdvice(prompt) {
    try {
      // Use Groq's API which follows OpenAI's format
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama3-70b-8192', // Use Groq's LLama3 model
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      
      // If Groq API is not available, fallback to template-based advice
      return this._generateFallbackAdvice(prompt);
    }
  }
  
  _generateFallbackAdvice(prompt) {
    // Extract key info from prompt
    const riskProfileMatch = prompt.match(/Risk profile assessment: (\w+)/i);
    const riskProfile = riskProfileMatch ? riskProfileMatch[1].toLowerCase() : 'moderate';
    
    const marketTrendMatch = prompt.match(/Market trend: (\w+)/i);
    const marketTrend = marketTrendMatch ? marketTrendMatch[1].toLowerCase() : 'neutral';
    
    // Generate template-based advice
    const templates = {
      conservative: {
        bullish: `
## Personalized DeFi Strategy: Conservative Growth in Bullish Market

Based on your conservative risk profile and the current bullish market, I recommend a capital preservation strategy with modest exposure to ETH appreciation.

### Asset Allocation
- Stablecoins (USDC, DAI): 65-75%
- Ethereum (ETH): 15-25%
- Other tokens: 0-10%

### DeFi Protocols
- Aave: For primary lending exposure (70% of stablecoins)
- Compound: For secondary lending (30% of stablecoins)
- Consider small ETH-stablecoin LP position on Curve (5% of total)

### Implementation Steps
1. Convert majority of capital to USDC and DAI
2. Deposit 70% of stablecoins into Aave
3. Deposit 30% of stablecoins into Compound
4. Hold ETH position to benefit from bullish trend
5. Consider small Curve stablecoin LP position for higher yield

### Expected Returns
5-8% APY over the next 6-12 months

### Risk Mitigation
- No leverage or borrowing
- Stick with established DeFi protocols
- Regular weekly monitoring
- Set price alerts for significant ETH price movements

### Gas Optimization
Execute transactions when gas is below 50 gwei, preferably during weekend off-hours for best rates.
`,
        bearish: `
## Personalized DeFi Strategy: Capital Preservation in Bearish Market

Based on your conservative risk profile and the current bearish market, I recommend focusing on capital preservation with minimal crypto exposure.

### Asset Allocation
- Stablecoins (USDC, DAI): 75-85%
- Ethereum (ETH): 5-15%
- Other tokens: 0-10%

### DeFi Protocols
- Aave: For secure stablecoin lending (60% of stablecoins)
- Compound: For diversified lending (40% of stablecoins)
- Small Curve stablecoin positions for higher yield

### Implementation Steps
1. Convert majority of capital to USDC and DAI
2. Deposit stablecoins across Aave and Compound
3. Maintain minimal ETH exposure during bearish trend
4. Consider dollar-cost averaging small amounts into ETH at regular intervals

### Expected Returns
3-5% APY over the next 6-12 months

### Risk Mitigation
- No leverage or borrowing
- Stick with top-tier DeFi protocols
- Diversify stablecoin holdings across multiple coins
- Regular monitoring for protocol security issues

### Gas Optimization
Batch transactions when gas is low, prioritize less frequent, larger deposits over multiple small ones.
`
      },
      moderate: {
        bullish: `
## Personalized DeFi Strategy: Balanced Growth in Bullish Market

Based on your moderate risk profile and the current bullish market conditions, I recommend a balanced approach with strategic ETH exposure.

### Asset Allocation
- Stablecoins (USDC, DAI): 35-55%
- Ethereum (ETH): 35-45%
- Other tokens: 10-20%

### DeFi Protocols
- Aave: For lending and modest borrowing
- Uniswap: For ETH-stablecoin liquidity provision
- Curve: For stablecoin yields
- Compound: For diversified lending exposure

### Implementation Steps
1. Deposit 25% of stablecoins into Aave
2. Provide ETH-USDC liquidity on Uniswap with 20% of capital
3. Hold 25% ETH for market appreciation
4. Deploy 15% to Curve for enhanced stablecoin yields
5. Consider limited borrowing against ETH (max 25% LTV) to amplify yields

### Expected Returns
8-15% APY over the next 6-12 months

### Risk Mitigation
- Maintain collateralization ratio above 250% for any borrowing
- Set up alerts for significant ETH price movements
- Rebalance monthly to maintain target allocation
- Keep some assets in reserve for market opportunities

### Gas Optimization
Use Layer 2 solutions where possible, execute transactions during lower gas periods (weekends, early mornings).
`,
        bearish: `
## Personalized DeFi Strategy: Defensive Positioning in Bearish Market

Based on your moderate risk profile and the current bearish market, I recommend a defensive approach with reduced ETH exposure and focus on stable yields.

### Asset Allocation
- Stablecoins (USDC, DAI): 55-65%
- Ethereum (ETH): 25-35%
- Other tokens: 5-15%

### DeFi Protocols
- Aave: For stablecoin lending (50% of stablecoins)
- Compound: For diversified lending (30% of stablecoins)
- Curve: For enhanced stablecoin yields (20% of stablecoins)
- Small Uniswap positions with tight ranges

### Implementation Steps
1. Convert additional crypto to stablecoins given bearish outlook
2. Distribute stablecoins across Aave, Compound, and Curve
3. Maintain reduced but meaningful ETH position
4. Consider dollar-cost averaging into ETH during major dips
5. Avoid borrowing in bearish conditions

### Expected Returns
5-9% APY over the next 6-12 months

### Risk Mitigation
- No leverage during market uncertainty
- Increase position monitoring frequency
- Maintain higher cash reserves for buying opportunities
- Diversify across multiple stablecoins

### Gas Optimization
Batch transactions and execute during low network usage periods, consider using L2s for smaller transactions.
`
      },
      aggressive: {
        bullish: `
## Personalized DeFi Strategy: Growth-Focused in Bullish Market

Based on your aggressive risk profile and the current bullish market, I recommend a growth-oriented strategy with strategic leverage to maximize returns.

### Asset Allocation
- Stablecoins (USDC, DAI): 15-25%
- Ethereum (ETH): 45-55%
- Other tokens: 25-35%

### DeFi Protocols
- Aave: For lending collateral and strategic borrowing
- Uniswap V3: For concentrated liquidity provision
- Curve: For boosted yields on stablecoins
- Consider yield aggregators for auto-compounding

### Implementation Steps
1. Deposit 50% of ETH as collateral in Aave
2. Borrow stablecoins at 40% of maximum LTV
3. Deploy borrowed funds + existing stablecoins to high-yield opportunities
4. Provide concentrated liquidity on Uniswap with 25% of capital
5. Allocate remaining funds to promising altcoin positions

### Expected Returns
18-30% APY over the next 6-12 months

### Risk Mitigation
- Monitor health factor closely, maintain above 1.5
- Set up automated alerts for collateral ratio changes
- Use stop-losses on altcoin positions
- Have a clear exit strategy for all positions

### Gas Optimization
Prioritize Layer 2 solutions and sidechains for smaller transactions, batch when possible, and time larger transactions during low gas periods.
`,
        bearish: `
## Personalized DeFi Strategy: Strategic Positioning in Bearish Market

Based on your aggressive risk profile and the current bearish market, I recommend a tactical approach balancing opportunity capture with downside protection.

### Asset Allocation
- Stablecoins (USDC, DAI): 25-35%
- Ethereum (ETH): 35-45%
- Other tokens: 20-30%

### DeFi Protocols
- Aave: For stablecoin yields and limited borrowing
- Uniswap: For strategic liquidity (wider ranges)
- Curve: For stable yields
- Consider options/structured products for downside protection

### Implementation Steps
1. Increase stablecoin allocation from typical aggressive portfolio
2. Maintain significant but reduced ETH exposure
3. Deploy stablecoins to Aave and Curve for yield
4. Consider strategic short positions or hedges
5. Prepare capital for buying opportunities if market drops further

### Expected Returns
8-15% APY over the next 6-12 months

### Risk Mitigation
- Use limited leverage (max 30% of portfolio)
- Implement hedging strategies where appropriate
- Higher cash reserves than typical aggressive allocation
- Regular rebalancing as market conditions evolve

### Gas Optimization
Use aggregators to reduce transaction count, consider moving to L2s for better gas efficiency during volatile periods.
`
      }
    };
    
    // Default to moderate/neutral if profile or trend not found
    const profileTemplates = templates[riskProfile] || templates.moderate;
    let trendTemplate = profileTemplates[marketTrend];
    
    if (!trendTemplate) {
      // Default to neutral advice if specific trend not found
      trendTemplate = profileTemplates.bullish.replace(/bullish/gi, 'neutral');
    }
    
    return trendTemplate;
  }
}

module.exports = new GroqClient(process.env.GROQ_API_KEY);