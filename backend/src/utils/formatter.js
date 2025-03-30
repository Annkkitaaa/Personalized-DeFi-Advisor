// backend/src/utils/formatter.js
const { timeStamp } = require('console');

// Format numbers to have commas
function formatNumber(num) {
  if (typeof num !== 'number') return num;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format currency with $ and commas
function formatCurrency(amount) {
  if (typeof amount !== 'number') return amount;
  return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format percentage values
function formatPercentage(value, decimals = 2) {
  if (typeof value !== 'number') return value;
  return value.toFixed(decimals) + '%';
}

// Format the response from AI into a structured format
function formatStrategyResponse(rawAdvice, contextData) {
  // Parse the AI response - adjust this as needed based on your AI response format
  let parsedAdvice;
  try {
    if (typeof rawAdvice === 'string') {
      // Try to extract JSON if AI returns a mix of text and JSON
      const jsonMatch = rawAdvice.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAdvice = JSON.parse(jsonMatch[0]);
      } else {
        // Parse the advice text into sections
        parsedAdvice = parseTextBasedAdvice(rawAdvice);
      }
    } else if (typeof rawAdvice === 'object') {
      parsedAdvice = rawAdvice;
    } else {
      throw new Error('Invalid advice format');
    }
  } catch (err) {
    console.error('Error parsing AI advice:', err);
    // Fall back to extracting sections manually
    parsedAdvice = parseTextBasedAdvice(rawAdvice.toString());
  }

  // Combine AI generated advice with real-time data
  const formattedAdvice = {
    summary: parsedAdvice.summary || extractSummary(rawAdvice),
    
    // Ensure asset allocation has correct percentage format
    allocation: normalizeAssetAllocation(parsedAdvice.allocation || 
                contextData.recommendations.assetAllocation || {}),
    
    // Ensure protocols are formatted consistently
    protocols: normalizeProtocols(parsedAdvice.protocols || 
              contextData.recommendations.protocols || []),
    
    // Ensure steps are complete
    steps: parsedAdvice.steps || contextData.recommendations.steps || [],
    
    // Ensure expected returns are numeric
    expectedReturns: normalizeExpectedReturns(parsedAdvice.expectedReturns || 
                    contextData.recommendations.expectedReturns || { min: 8, max: 16, timeframe: '12 months' }),
    
    // Ensure risk factors exist
    risks: parsedAdvice.risks || contextData.recommendations.risks || [
      "Market volatility may affect returns",
      "Smart contract risk in DeFi protocols",
      "Regulatory uncertainty in the crypto space"
    ],
    
    // Market insights from real-time data
    marketInsights: {
      ethPrice: contextData.marketData.ethPrice,
      gasPrice: contextData.marketData.gasPrice,
      trend: contextData.marketData.marketTrend
    },
    
    // Top opportunities based on risk profile
    topOpportunities: parsedAdvice.topOpportunities || 
                     getTopOpportunities(contextData.recommendations, contextData.userProfile) || [],
    
    // Add a timestamp
    timestamp: new Date().toISOString(),
    
    // Add a standard disclaimer
    disclaimer: "This is AI-generated financial advice based on real-time blockchain data. Always conduct your own research before making investment decisions."
  };

  return formattedAdvice;
}

// Helper function to normalize asset allocation percentages
function normalizeAssetAllocation(allocation) {
  const normalized = {};
  
  for (const [asset, value] of Object.entries(allocation)) {
    if (typeof value === 'string') {
      // If it's already a percentage string like "40-60%", keep it
      if (value.includes('%') || value.includes('-')) {
        normalized[asset] = value;
      } else {
        // Convert to number and append %
        const num = parseInt(value);
        normalized[asset] = isNaN(num) ? value : num;
      }
    } else if (typeof value === 'number') {
      // Keep numbers as they are (don't convert to "25%")
      normalized[asset] = value;
    } else {
      // Default case
      normalized[asset] = '0';
    }
  }
  
  return normalized;
}

// Helper function to normalize protocols
function normalizeProtocols(protocols) {
  if (!Array.isArray(protocols)) return [];
  
  return protocols.filter(protocol => 
    typeof protocol === 'string' && protocol.trim().length > 0
  );
}

// Helper function to normalize expected returns
function normalizeExpectedReturns(returns) {
  const normalized = {
    min: null,
    max: null,
    timeframe: '12 months'
  };
  
  if (returns) {
    // Ensure min and max are numbers
    if (returns.min !== undefined) {
      normalized.min = typeof returns.min === 'string' ? 
        parseFloat(returns.min.replace(/%/g, '')) : returns.min;
    }
    
    if (returns.max !== undefined) {
      normalized.max = typeof returns.max === 'string' ? 
        parseFloat(returns.max.replace(/%/g, '')) : returns.max;
    }
    
    // Use provided timeframe or default
    normalized.timeframe = returns.timeframe || normalized.timeframe;
  }
  
  return normalized;
}

// Helper to parse text-based advice
function parseTextBasedAdvice(text) {
  // Simple implementation - extract sections by heading
  const sections = {
    summary: '',
    allocation: {},
    protocols: [],
    steps: [],
    risks: []
  };
  
  // Extract summary
  const summaryMatch = text.match(/Summary:(.*?)(?=\n\n|\n#|\n\*\*)/s);
  if (summaryMatch) {
    sections.summary = summaryMatch[1].trim();
  }
  
  // Extract allocation
  const allocationMatch = text.match(/Asset Allocation:(.*?)(?=\n\n|\n#|\n\*\*)/s);
  if (allocationMatch) {
    const allocationText = allocationMatch[1];
    const allocLines = allocationText.split('\n');
    
    allocLines.forEach(line => {
      const match = line.match(/[\-\*]?\s*([^:]+):\s*([^%]+)%?/);
      if (match) {
        const asset = match[1].trim();
        const value = match[2].trim();
        
        if (asset && value) {
          // Try to convert to number if possible
          const numValue = parseFloat(value);
          sections.allocation[asset] = isNaN(numValue) ? value : numValue;
        }
      }
    });
  }
  
  // Extract protocols
  const protocolsMatch = text.match(/Recommended Protocols:(.*?)(?=\n\n|\n#|\n\*\*)/s);
  if (protocolsMatch) {
    const protocolsText = protocolsMatch[1];
    const protocolLines = protocolsText.split('\n');
    
    protocolLines.forEach(line => {
      const match = line.match(/[\-\*]?\s*(.+)/);
      if (match && match[1].trim()) {
        sections.protocols.push(match[1].trim());
      }
    });
  }
  
  // Extract steps
  const stepsMatch = text.match(/Implementation Steps:(.*?)(?=\n\n|\n#|\n\*\*)/s);
  if (stepsMatch) {
    const stepsText = stepsMatch[1];
    const stepLines = stepsText.split('\n');
    
    stepLines.forEach(line => {
      const match = line.match(/[\-\*]?\s*(.+)/);
      if (match && match[1].trim()) {
        sections.steps.push(match[1].trim());
      }
    });
  }
  
  // Extract risks
  const risksMatch = text.match(/Risk Factors:(.*?)(?=\n\n|\n#|\n\*\*)/s);
  if (risksMatch) {
    const risksText = risksMatch[1];
    const riskLines = risksText.split('\n');
    
    riskLines.forEach(line => {
      const match = line.match(/[\-\*]?\s*(.+)/);
      if (match && match[1].trim()) {
        sections.risks.push(match[1].trim());
      }
    });
  }
  
  return sections;
}

// Extract a summary if one wasn't provided
function extractSummary(rawAdvice) {
  if (typeof rawAdvice !== 'string') {
    return 'Personalized DeFi strategy based on your risk profile and current market conditions.';
  }
  
  // Try to extract the first paragraph
  const firstPara = rawAdvice.split('\n\n')[0];
  if (firstPara && firstPara.length > 20) {
    return firstPara.trim();
  }
  
  return 'Personalized DeFi strategy based on your risk profile and current market conditions.';
}

// Get top opportunities based on recommendations and user profile
function getTopOpportunities(recommendations, userProfile) {
  // Default opportunities if none provided
  const defaultOpps = [
    {
      protocol: 'Uniswap',
      asset: 'ETH-USDC',
      apy: 9.1,
      risk: 6
    },
    {
      protocol: 'Curve',
      asset: 'stETH',
      apy: 3.2,
      risk: 5
    },
    {
      protocol: 'Aave',
      asset: 'USDC',
      apy: 3.1,
      risk: 3
    }
  ];
  
  // If we have real opportunities, use those
  if (recommendations.bestOpportunities && 
      Array.isArray(recommendations.bestOpportunities) && 
      recommendations.bestOpportunities.length > 0) {
    return recommendations.bestOpportunities;
  }
  
  return defaultOpps;
}

module.exports = {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatStrategyResponse,
  normalizeAssetAllocation,
  normalizeProtocols,
  normalizeExpectedReturns
};