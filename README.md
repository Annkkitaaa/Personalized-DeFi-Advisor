# Personalized DeFi Advisor

A comprehensive DeFi advisory platform that provides personalized strategy recommendations based on real-time blockchain data, user risk profiles, and current market conditions.

![image](https://github.com/user-attachments/assets/f79f160e-7ff1-4ac3-811d-17add1a61e89)


## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Deployment](#deployment)
- [How It Works](#how-it-works)
- [Technologies Used](#technologies-used)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Personalized DeFi Advisor is a full-stack application that leverages real-time blockchain data to provide customized DeFi investment strategies based on user preferences. The platform analyzes current market conditions, protocol APYs, and risk factors to recommend optimal asset allocations, protocol selections, and implementation steps tailored to each user's risk profile, time horizon, and capital.

## Features

- **Personalized Strategy Recommendations**: Custom DeFi investment strategies based on risk profile, time horizon, and capital.
- **Real-Time Blockchain Data**: Live data from Ethereum mainnet via Alchemy and Etherscan.
- **Dynamic Dashboard**: Interactive dashboard showing current market metrics and DeFi protocol performance.
- **Strategy Visualization**: Visual representation of recommended asset allocation with detailed implementation steps.
- **Smart Contract Simulation**: Simulate DeFi operations (deposits, swaps) without executing actual transactions.
- **Risk Analysis**: Comprehensive risk assessment for each recommendation with market-aware risk factors.
- **Protocol Monitoring**: Track performance metrics for top DeFi protocols (Aave, Compound, Uniswap, Curve).
- **Wallet Integration**: Connect your Ethereum wallet for personalized advice based on your holdings.

## Architecture

The application follows a client-server architecture:

### Frontend
- React single-page application
- Tailwind CSS for styling with a cyberpunk theme
- Web3 integration for wallet connectivity
- Chart.js for data visualization
- Context API for state management

### Backend
- Node.js Express server
- RESTful API endpoints
- Real-time blockchain data fetching
- On-chain contract interactions
- AI-powered advice generation

### Data Flow
1. User provides risk profile, time horizon, and capital (optionally connects wallet)
2. Backend fetches real-time data from Ethereum blockchain
3. Advisory algorithm generates personalized recommendations
4. Frontend displays strategy with visualizations and implementation steps

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Alchemy API key
- Etherscan API key
- Groq API key (for AI-powered advice)

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/personalized-defi-advisor.git
cd personalized-defi-advisor
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create environment variables
   
Create a `.env` file in the backend directory:
```
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key
GROQ_API_KEY=your_groq_key
PORT=3001
```

Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:3001/api
```

4. Run the application

Start the backend:
```bash
cd backend
npm run start
```

Start the frontend:
```bash
cd frontend
npm run start
```

The application should now be running on [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploying to Netlify

#### Frontend Deployment

1. Create a `netlify.toml` file in the root of your frontend directory:

```toml
[build]
  base = "frontend"
  publish = "build"
  command = "npm run build"

[context.production.environment]
  REACT_APP_API_URL = "https://your-backend-url.herokuapp.com/api"
```

2. Set up continuous deployment by connecting your GitHub repository to Netlify, or deploy manually:

```bash
cd frontend
npm run build
npx netlify deploy --prod
```

## How It Works

### User Flow

1. **Onboarding**
   - User completes a risk profile questionnaire
   - Inputs investment capital and time horizon
   - Optionally connects Ethereum wallet

2. **Dashboard**
   - Views current market conditions (ETH price, gas fees, market trend)
   - Sees performance metrics of major DeFi protocols
   - Accesses yield comparison across protocols

3. **Strategy Generation**
   - System fetches real-time blockchain data using Alchemy and Etherscan
   - Algorithm analyzes protocol performance, risk factors, and market trends
   - Generates personalized recommendations based on user profile

4. **Strategy Visualization**
   - Displays recommended asset allocation with color-coded segments
   - Shows implementation steps with dollar amounts
   - Lists recommended protocols with current APY rates
   - Provides risk assessment specific to the strategy

5. **Simulation**
   - User can simulate DeFi operations (deposits, swaps)
   - System estimates gas costs and potential returns
   - Previews transaction effects without execution

### Data Sources

- **Aave**: Lending/borrowing rates, liquidation thresholds
- **Compound**: Supply/borrow rates, collateral factors
- **Uniswap**: Liquidity pool data, fees, estimated APY
- **Curve**: Stablecoin and ETH pool data, APY rates
- **Chainlink**: ETH price feeds
- **Etherscan**: Gas prices, historical data, wallet analysis

### Recommendation Algorithm

The recommendation engine considers multiple factors:

1. **Risk Profile Matching**
   - Conservative: Lower-risk stablecoin allocations, established protocols
   - Moderate: Balanced approach with liquidity provision and some ETH
   - Aggressive: Higher ETH allocation, higher-yield opportunities

2. **Market-Adaptive Adjustments**
   - Bear market: Increases stablecoin allocation, reduces volatile assets
   - Bull market: Increases ETH exposure, favors growth opportunities
   - Neutral market: Balanced approach based on risk profile

3. **Protocol Selection**
   - Analyzes real-time APY rates across protocols
   - Considers protocol security and track record
   - Ranks opportunities by risk-adjusted return

4. **Risk Assessment**
   - Identifies specific risks based on recommended allocations
   - Adjusts risk factors based on market conditions
   - Provides tailored risk warnings for user education

## Technologies Used

### Frontend
- **React**: UI library
- **Tailwind CSS**: Styling framework
- **Chart.js**: Data visualization
- **Framer Motion**: Animations
- **Ethers.js**: Ethereum interaction
- **Axios**: API requests

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Ethers.js**: Blockchain interaction
- **Axios**: External API requests
- **Groq SDK**: AI integrations

### Blockchain Integrations
- **Alchemy API**: Ethereum data provider
- **Etherscan API**: Transaction and contract data
- **Web3 Wallets**: MetaMask integration

## Future Improvements

### Short-term Enhancements
- **Mobile Optimization**: Improve responsive design for mobile users
- **Multi-chain Support**: Add support for Polygon, Optimism, and other L2 solutions
- **Portfolio Tracking**: Add portfolio performance tracking over time
- **Notification System**: Alert users about significant market changes or opportunities
- **User Profiles**: Save and compare multiple strategy scenarios

### Medium-term Roadmap
- **Smart Contract Execution**: Enable direct execution of recommended strategies
- **DeFi Aggregation**: Implement a DeFi aggregator to execute strategies via the optimal routes
- **Yield Farming Strategies**: Add specialized yield farming recommendations
- **Tax Reporting Integration**: Generate tax reports for DeFi activities
- **Community Features**: Add community ratings and reviews for strategies

### Long-term Vision
- **Machine Learning Models**: Implement ML for strategy optimization based on historical performance
- **Multi-asset Strategies**: Expand beyond Ethereum to include multiple blockchain ecosystems
- **Decentralized Infrastructure**: Move to fully decentralized backend services
- **Governance System**: Add DAO-based governance for strategy templates and risk models
- **Enterprise Features**: Develop institutional-grade tools and reporting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
