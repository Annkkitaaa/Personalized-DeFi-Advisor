class DeFiCalculator {
    calculateCompoundInterest(principal, rate, time, compoundFrequency = 365) {
      // Calculate compound interest: A = P(1 + r/n)^(nt)
      const r = rate / 100; // Convert percentage to decimal
      const n = compoundFrequency;
      const t = time / 12; // Convert months to years
      
      return principal * Math.pow(1 + r/n, n*t);
    }
    
    calculateImpermanentLoss(priceChangeRatio) {
      // Calculate impermanent loss based on price change ratio
      // IL = 2 * sqrt(priceChangeRatio) / (1 + priceChangeRatio) - 1
      return 2 * Math.sqrt(priceChangeRatio) / (1 + priceChangeRatio) - 1;
    }
    
    estimateLiquidityProviderReturns(initialAmount, feeTier, dailyVolume, poolLiquidity, days) {
      // Calculate LP returns: (Your liquidity / Total liquidity) * Volume * Fee * Days
      const yourShare = initialAmount / poolLiquidity;
      const dailyFees = dailyVolume * (feeTier / 100);
      const yourDailyFees = dailyFees * yourShare;
      
      return yourDailyFees * days;
    }
    
    calculateLoanToValue(collateralAmount, borrowAmount, collateralPrice, borrowPrice) {
      // Calculate Loan-to-Value ratio
      const collateralValue = collateralAmount * collateralPrice;
      const borrowValue = borrowAmount * borrowPrice;
      
      return (borrowValue / collateralValue) * 100;
    }
    
    estimateLiquidationRisk(currentLTV, liquidationThreshold, volatility) {
      // Higher number means higher risk (0-100 scale)
      const buffer = liquidationThreshold - currentLTV;
      // Simplified calculation - in reality would be more complex
      const riskScore = 100 - (buffer / (volatility / 10) * 100);
      
      return Math.max(0, Math.min(100, riskScore));
    }
    
    optimizeGasPrice(transactionType, currentGasPrice, urgency) {
      // Base gas units for different transaction types
      const gasUnits = {
        'transfer': 21000,
        'swap': 150000,
        'liquidityAdd': 200000,
        'lending': 250000,
        'complex': 350000
      };
      
      const units = gasUnits[transactionType] || 100000;
      
      // Adjust price based on urgency (1-5, with 5 being most urgent)
      let multiplier;
      switch (urgency) {
        case 1: multiplier = 0.8; break;
        case 2: multiplier = 0.9; break;
        case 3: multiplier = 1.0; break;
        case 4: multiplier = 1.2; break;
        case 5: multiplier = 1.5; break;
        default: multiplier = 1.0;
      }
      
      const suggestedGasPrice = currentGasPrice * multiplier;
      const totalCost = (suggestedGasPrice * units) / 10**9; // Cost in ETH
      
      return {
        gasUnits: units,
        suggestedGasPrice,
        totalCostETH: totalCost
      };
    }
    
    calculateRiskAdjustedReturn(expectedReturn, riskLevel) {
      // Simple Sharpe-like ratio
      // Higher numbers are better (risk-adjusted return)
      const riskFactor = {
        'very low': 1,
        'low': 2,
        'medium-low': 3,
        'medium': 5,
        'medium-high': 7,
        'high': 10,
        'very high': 15
      }[riskLevel.toLowerCase()] || 5;
      
      return expectedReturn / riskFactor;
    }
    
    optimizePortfolio(investments, riskTolerance) {
      // Simple portfolio optimization
      // Sort investments by risk-adjusted return
      investments.sort((a, b) => {
        const aRAR = this.calculateRiskAdjustedReturn(a.expectedReturn, a.riskLevel);
        const bRAR = this.calculateRiskAdjustedReturn(b.expectedReturn, b.riskLevel);
        return bRAR - aRAR;
      });
      
      // Allocate based on risk tolerance
      const allocation = {};
      let remainingAllocation = 100;
      
      // Higher risk tolerance = more concentrated portfolio
      const diversificationFactor = 11 - riskTolerance; // 1-10 scale, inverted
      
      for (let i = 0; i < Math.min(diversificationFactor, investments.length); i++) {
        let alloc;
        if (i === 0) {
          // Allocate more to the best opportunity
          alloc = Math.min(remainingAllocation, 40 + (riskTolerance * 5));
        } else {
          // Distribute the rest
          alloc = Math.min(remainingAllocation, (remainingAllocation / (diversificationFactor - i)));
        }
        
        allocation[investments[i].name] = alloc;
        remainingAllocation -= alloc;
      }
      
      return allocation;
    }
  
    // Calculate maximum safe borrowing amount based on collateral value and LTV ratio
    calculateMaxBorrow(collateralValue, maxLTV, currentDebt = 0) {
      const maxBorrow = (collateralValue * maxLTV / 100) - currentDebt;
      return Math.max(0, maxBorrow);
    }
  
    // Calculate health factor for a lending position
    calculateHealthFactor(collateralValue, liquidationThreshold, totalBorrows) {
      if (totalBorrows === 0) return Infinity;
      return (collateralValue * liquidationThreshold / 100) / totalBorrows;
    }
  
    // Estimate gas costs in USD
    estimateGasCostUSD(gasUnits, gasPriceGwei, ethPriceUSD) {
      const gasPrice = parseFloat(gasPriceGwei);
      const ethPrice = parseFloat(ethPriceUSD);
      const gasEth = (gasUnits * gasPrice * 10**-9);
      return gasEth * ethPrice;
    }
    
    // Determine if a DeFi operation is worth the gas cost
    isWorthTheGas(expectedProfit, gasCostUSD, timeHorizonDays) {
      // Only proceed if gas cost is less than 5% of expected profit over time horizon
      return gasCostUSD < (expectedProfit * 0.05);
    }
    
    // Calculate the optimal time to harvest yield rewards based on gas costs
    calculateOptimalHarvestTime(dailyRewardUSD, harvestGasCostUSD) {
      if (dailyRewardUSD === 0) return Infinity;
      // Wait until rewards are at least 5x the gas cost
      return Math.ceil(harvestGasCostUSD * 5 / dailyRewardUSD);
    }
  }
  
  module.exports = new DeFiCalculator();