// backend/src/utils/formatter.js
function formatStrategyResponse(rawAdvice, contextData) {
  // Convert AI text response into a structured format
  const sections = parseAdviceSections(rawAdvice);
  
  return {
    summary: sections.summary || '',
    allocation: sections.allocation || {},
    protocols: sections.protocols || [],
    steps: sections.steps || [],
    expectedReturns: sections.expectedReturns || { min: null, max: null, timeframe: null },
    risks: sections.risks || [],
    marketInsights: {
      ethPrice: contextData.marketData.ethPrice,
      gasPrice: contextData.marketData.gasPrice,
      trend: typeof contextData.marketData.marketTrend === 'string' ? 
        contextData.marketData.marketTrend : 
        contextData.marketData.marketTrend || 'neutral',
      timestamp: contextData.timestamp || new Date().toISOString()
    },
    topOpportunities: contextData.protocolData.bestOpportunities || [],
    riskProfile: contextData.userProfile || 'moderate',
    rawAdvice: rawAdvice,
    disclaimer: "This is AI-generated financial advice based on real-time blockchain data. Always conduct your own research before making investment decisions."
  };
}

function parseAdviceSections(text) {
  const sections = {
    summary: '',
    allocation: {},
    protocols: [],
    steps: [],
    expectedReturns: { min: null, max: null, timeframe: null },
    risks: []
  };
  
  // Extract summary (typically the first paragraph)
  const paragraphs = text.split('\n\n');
  if (paragraphs.length > 0) {
    sections.summary = paragraphs[0].trim();
  }
  
  // Parse asset allocation
  const allocationMatch = text.match(/Asset Allocation[:\s]+([\s\S]+?)(?=##|$)/i);
  if (allocationMatch) {
    const allocationText = allocationMatch[1];
    const allocationLines = allocationText.split('\n');
    
    for (const line of allocationLines) {
      const match = line.match(/[-\s•]*([A-Za-z\s]+):\s*([0-9]+(?:-[0-9]+)?%?)/i);
      if (match) {
        const asset = match[1].trim();
        const allocation = match[2].trim();
        sections.allocation[asset] = allocation;
      }
    }
  }
  
  // Parse protocols
  const protocolMatch = text.match(/(?:Recommended Protocols|DeFi Protocols)[:\s]+([\s\S]+?)(?=##|$)/i);
  if (protocolMatch) {
    const protocolText = protocolMatch[1];
    const protocolLines = protocolText.split('\n');
    
    for (const line of protocolLines) {
      if (line.match(/[-\s•]/)) {
        const protocol = line.replace(/[-\s•]/, '').trim();
        if (protocol && !sections.protocols.includes(protocol)) {
          sections.protocols.push(protocol);
        }
      } else if (line.includes(',')) {
        // Handle comma-separated list
        const protocols = line.split(',').map(p => p.trim());
        for (const protocol of protocols) {
          if (protocol && !sections.protocols.includes(protocol)) {
            sections.protocols.push(protocol);
          }
        }
      }
    }
  }
  
  // Parse implementation steps
  const stepsMatch = text.match(/(?:Implementation Steps|Step-by-step Implementation)[:\s]+([\s\S]+?)(?=##|$)/i);
  if (stepsMatch) {
    const stepsText = stepsMatch[1];
    const stepLines = stepsText.split('\n');
    
    for (const line of stepLines) {
      const match = line.match(/[-\s•\d.]*\s*(.+)/);
      if (match && match[1].trim()) {
        sections.steps.push(match[1].trim());
      }
    }
  }
  
  // Parse expected returns
  const returnsMatch = text.match(/Expected Returns[:\s]+([\s\S]+?)(?=##|$)/i);
  if (returnsMatch) {
    const returnsText = returnsMatch[1];
    
    // Look for percentage ranges and timeframes
    const percentageMatch = returnsText.match(/([0-9.]+)%\s*-\s*([0-9.]+)%/);
    const timeframeMatch = returnsText.match(/([0-9.]+)\s*(months|years|days)/i);
    
    if (percentageMatch) {
      sections.expectedReturns.min = parseFloat(percentageMatch[1]);
      sections.expectedReturns.max = parseFloat(percentageMatch[2]);
    }
    
    if (timeframeMatch) {
      sections.expectedReturns.timeframe = timeframeMatch[0];
    }
  }
  
  // Parse risks
  const risksMatch = text.match(/(?:Risks|Risk Factors|Risk Mitigation)[:\s]+([\s\S]+?)(?=##|$)/i);
  if (risksMatch) {
    const risksText = risksMatch[1];
    const riskLines = risksText.split('\n');
    
    for (const line of riskLines) {
      const match = line.match(/[-\s•\d.]*\s*(.+)/);
      if (match && match[1].trim()) {
        sections.risks.push(match[1].trim());
      }
    }
  }
  
  return sections;
}

module.exports = {
  formatStrategyResponse
};