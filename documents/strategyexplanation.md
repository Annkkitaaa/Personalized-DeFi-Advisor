# Strategy Explanation: The Math Behind DeFi Advisor

This document explains the mathematical models, financial principles, and algorithmic approaches used in the Personalized DeFi Advisor platform to generate tailored investment strategies.

## Table of Contents

1. [Strategy Generation Overview](#strategy-generation-overview)
2. [Risk Profiling and Quantification](#risk-profiling-and-quantification)
3. [Asset Allocation Formulas](#asset-allocation-formulas)
4. [Protocol Selection Algorithm](#protocol-selection-algorithm)
5. [Risk-Adjusted Return Calculation](#risk-adjusted-return-calculation)
6. [Expected Returns Modeling](#expected-returns-modeling)
7. [Implementation Steps Generation](#implementation-steps-generation)
8. [Market Trend Analysis](#market-trend-analysis)
9. [Risk Assessment Framework](#risk-assessment-framework)
10. [Example Calculation Walkthrough](#example-calculation-walkthrough)

## Strategy Generation Overview

The DeFi Advisor uses a multi-step process to generate personalized strategies:

1. **User Profile Analysis**: Convert user inputs into risk parameters
2. **Market Data Collection**: Gather real-time protocol performance data
3. **Opportunity Ranking**: Rank DeFi opportunities based on risk-adjusted returns
4. **Asset Allocation**: Determine optimal allocation percentages
5. **Protocol Selection**: Select specific protocols aligned with the allocation
6. **Implementation Planning**: Generate step-by-step implementation instructions
7. **Risk Assessment**: Identify and quantify strategy-specific risks

Each step involves specific mathematical models as detailed below.

## Risk Profiling and Quantification

### Risk Tolerance Conversion

User risk tolerance (1-10 scale) is mapped to a risk coefficient (`Rc`):

```
Rc = 0.5 + (UserRiskTolerance - 1) * 0.05
```

This gives a range from 0.5 (very conservative) to 0.95 (very aggressive).

### Time Horizon Factor

Time horizon in months is converted to a time horizon factor (`Thf`):

```
Thf = 0.8 + (TimeHorizonMonths / 120)
```

Capped at 1.3 for horizons beyond 60 months.

### Composite Risk Profile

The composite risk profile (`CRP`) combines these factors:

```
CRP = Rc * Thf
```

This value ranges from 0.4 (most conservative) to 1.24 (most aggressive) and determines the base asset allocation.

## Asset Allocation Formulas

### Base Allocation by Risk Profile

For a given Composite Risk Profile (`CRP`), the base allocations are:

```
StablecoinPercentage = 80 - (CRP * 50)
EthereumPercentage = 10 + (CRP * 35)
AltcoinPercentage = CRP * 20
LiquidityPoolPercentage = 5 + (CRP * 5)
StakingPercentage = 5
```

### Market Trend Adjustment

Market trend modifies the base allocation using a Market Trend Factor (`MTF`):
- Bullish market: `MTF = 1.2`
- Neutral market: `MTF = 1.0`
- Bearish market: `MTF = 0.8`

Adjusted allocations:

```
AdjustedEthPercentage = EthereumPercentage * MTF
AdjustedStablecoinPercentage = StablecoinPercentage + (EthereumPercentage - AdjustedEthPercentage)
```

### Allocation Normalization

Ensure all allocations sum to 100%:

```
TotalAllocation = sum(AllAssetPercentages)
NormalizedAllocation = AssetPercentage * (100 / TotalAllocation)
```

## Protocol Selection Algorithm

### Protocol Risk Scoring

Each protocol (`p`) receives a base risk score (`Rbase`) from 1-10 based on:
- Smart contract security
- Protocol longevity
- TVL (Total Value Locked)
- Team credibility
- Audit status

### Asset Risk Scoring

Each asset (`a`) receives a risk score (`Rasset`) from 1-10:
- Stablecoins: 1-3
- ETH: 4-5
- Other Layer 1s: 5-7
- Altcoins: 7-10

### Activity Risk Scoring

Each activity (`act`) receives a risk score (`Ract`) from 1-10:
- Lending: 2-4
- Staking: 3-5
- Liquidity Provision: 5-8
- Yield Farming: 7-10

### Composite Risk Score

The composite risk score (`CRS`) for a protocol-asset-activity combination:

```
CRS = (Rbase * 0.4) + (Rasset * 0.3) + (Ract * 0.3)
```

### Opportunity Filtering

Opportunities are filtered based on the user's Composite Risk Profile (`CRP`):

```
MaxRiskScore = 3 + (CRP * 7)
FilteredOpportunities = Opportunities.filter(opp => opp.CRS <= MaxRiskScore)
```

## Risk-Adjusted Return Calculation

### Raw Return Measurement

The raw return (`RR`) for an opportunity is its current APY.

### Risk-Adjusted Return (RAR)

The risk-adjusted return factors in the composite risk score:

```
RAR = RR / (CRS ^ RiskAdjustmentPower)
```

Where `RiskAdjustmentPower` varies by risk profile:
- Conservative: 2.0
- Moderate: 1.5
- Aggressive: 1.0

### Opportunity Ranking

Opportunities are ranked by their Risk-Adjusted Return (`RAR`), with higher values being more favorable.

## Expected Returns Modeling

### Weighted Average Return

The expected return of the portfolio is a weighted average of component returns:

```
PortfolioReturn = ∑(AllocationPercentage_i * ExpectedReturn_i) / 100
```

### Range Calculation

To provide a min-max range, we use volatility estimates:

```
ReturnRangeMin = PortfolioReturn * (1 - (VolatilityEstimate * 0.5))
ReturnRangeMax = PortfolioReturn * (1 + (VolatilityEstimate * 0.5))
```

Where `VolatilityEstimate` is based on asset class historical volatility.

### Compound Interest Calculation

For longer time horizons, we apply compound interest:

```
ProjectedValue = InitialCapital * (1 + (PortfolioReturn/100))^(TimeHorizonYears)
```

## Implementation Steps Generation

### Capital Allocation

Each implementation step allocates a portion of the total capital:

```
StepAmount_i = TotalCapital * (AllocationPercentage_i / 100)
```

### Step Ordering

Steps are ordered by priority and dependency:
1. Stablecoin acquisition (if needed)
2. ETH acquisition (if needed)
3. Lending/staking operations
4. Liquidity provision operations
5. Complex strategies (if applicable)

### Gas Optimization

For each step, estimated gas costs are calculated:

```
EstimatedGasCost = GasUnits * GasPrice * ETHPrice
```

Steps are batched when possible to minimize gas costs.

## Market Trend Analysis

### Relative Strength Index (RSI)

The 14-day RSI is calculated as:

```
RSI = 100 - (100 / (1 + RS))
```

Where `RS` is the ratio of average gains to average losses over 14 days.

### Trend Determination

Market trend is determined by:
- RSI > 70: Bullish
- RSI < 30: Bearish
- 30 <= RSI <= 70: Neutral

### Trend Confidence

Confidence in the trend is calculated using multiple indicators:
- Moving Average convergence/divergence
- Volume analysis
- Support/resistance levels

## Risk Assessment Framework

### Risk Vector

For each strategy, a risk vector is generated with components:

```
RiskVector = [MarketRisk, SmartContractRisk, LiquidityRisk, InterestRateRisk, 
              RegulatoryRisk, ImpermanentLossRisk, GasRisk]
```

### Risk Quantification

Each risk component is quantified on a scale of 1-10 based on:
- Current market conditions
- Strategy composition
- Historical risk patterns

### Risk Narrative Generation

The top 3-5 risks by magnitude are converted into plain language explanations with specific relevance to the generated strategy.

## Example Calculation Walkthrough

### Sample User Profile:
- Risk Tolerance: 7/10
- Time Horizon: 24 months
- Capital: $10,000

### Step 1: Risk Profile Calculation
```
Rc = 0.5 + (7 - 1) * 0.05 = 0.8
Thf = 0.8 + (24 / 120) = 1.0
CRP = 0.8 * 1.0 = 0.8
```

### Step 2: Base Allocation
```
StablecoinPercentage = 80 - (0.8 * 50) = 40%
EthereumPercentage = 10 + (0.8 * 35) = 38%
AltcoinPercentage = 0.8 * 20 = 16%
LiquidityPoolPercentage = 5 + (0.8 * 5) = 9%
StakingPercentage = 5%
```

### Step 3: Market Adjustment (Neutral Market)
```
MTF = 1.0
AdjustedEthPercentage = 38% * 1.0 = 38%
AdjustedStablecoinPercentage = 40% (no change)
```

### Step 4: Risk-Adjusted Protocol Selection
For a user with CRP = 0.8:
```
MaxRiskScore = 3 + (0.8 * 7) = 8.6
```

Protocol examples:
- Aave (ETH lending): CRS = 4.2, APY = 1.2%, RAR = 1.2 / (4.2^1.5) = 0.14
- Compound (USDC lending): CRS = 3.5, APY = 2.2%, RAR = 2.2 / (3.5^1.5) = 0.34
- Uniswap (ETH-USDC): CRS = 7.2, APY = 8.5%, RAR = 8.5 / (7.2^1.5) = 0.44
- Curve (stETH): CRS = 5.8, APY = 3.2%, RAR = 3.2 / (5.8^1.5) = 0.23

Top protocols by RAR:
1. Uniswap (ETH-USDC): 0.44
2. Compound (USDC): 0.34
3. Curve (stETH): 0.23
4. Aave (ETH): 0.14

### Step 5: Final Allocation
```
Stablecoins (Compound USDC): $4,000 (40%)
Ethereum: $3,800 (38%)
- Direct holding: $2,400 (24%)
- Uniswap ETH-USDC: $900 (9%)
- ETH Staking: $500 (5%)
Altcoins: $1,600 (16%)
```

### Step 6: Expected Returns
```
Compound USDC (40%): 2.2% APY
ETH holding (24%): 15% estimated
Uniswap ETH-USDC (9%): 8.5% APY
ETH Staking (5%): 5% APY
Altcoins (16%): 20% estimated

PortfolioReturn = (40*2.2 + 24*15 + 9*8.5 + 5*5 + 16*20)/100 = 9.26%

VolatilityEstimate = 0.3
ReturnRangeMin = 9.26 * (1 - 0.3*0.5) = 7.87%
ReturnRangeMax = 9.26 * (1 + 0.3*0.5) = 10.65%
```

### Step 7: Implementation Steps
```
1. Convert $4,000 to USDC and deposit in Compound (Est. return: $88/year)
2. Allocate $3,800 to Ethereum
3. Use $900 worth of ETH to provide liquidity on Uniswap ETH-USDC pool (Est. return: $76.50/year)
4. Stake $500 worth of ETH (Est. return: $25/year)
5. Allocate $1,600 to selected altcoins (Est. return: $320/year)

Total estimated annual return: $509.50 (9.26%)
Projected value after 24 months: $11,934
```

This detailed example illustrates how the DeFi Advisor combines user inputs, market data, and financial principles to generate personalized, mathematically sound investment strategies.