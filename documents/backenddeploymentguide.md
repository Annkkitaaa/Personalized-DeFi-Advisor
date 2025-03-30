# Deploying Your DeFi Advisor Backend to Render

This guide explains how to deploy the backend of your Personalized DeFi Advisor to [Render](https://render.com), which offers a free tier for web services.

## Prerequisites

- A GitHub repository containing your project
- Your Alchemy, Etherscan, and Groq API keys
- A Render account (free to create)

## Deployment Steps

### 1. Prepare Your Backend for Deployment

1. Ensure your `package.json` has a proper start script:
```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}
```

2. Make sure your server listens on the port provided by Render:
```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

3. Add a `render.yaml` file in your backend directory:
```yaml
services:
  - type: web
    name: defi-advisor-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: ALCHEMY_API_KEY
        sync: false
      - key: ETHERSCAN_API_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
```

4. Commit and push these changes to your GitHub repository.

### 2. Create a New Web Service on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Click on "New" and select "Web Service"
3. Choose "Connect from GitHub repository"
4. Select your GitHub repository
5. Configure the service:
   - **Name**: defi-advisor-api
   - **Environment**: Node
   - **Region**: Choose the closest to your target users
   - **Branch**: main (or your default branch)
   - **Root Directory**: backend (if your backend is in a subdirectory)
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Plan**: Free

6. Add your environment variables:
   - ALCHEMY_API_KEY
   - ETHERSCAN_API_KEY
   - GROQ_API_KEY
   - Any other required variables

7. Click "Create Web Service"

### 3. Verify Deployment

1. Render will automatically deploy your service. Wait for the deployment to complete.
2. Once deployed, you'll get a URL like: `https://defi-advisor-api.onrender.com`
3. Test an endpoint, e.g., `https://defi-advisor-api.onrender.com/api/market`
4. Check the logs in the Render dashboard for any errors

### 4. Update Your Frontend Configuration

Update your frontend to use the deployed backend URL:

1. Create a production environment file `.env.production` in your frontend directory:
```
REACT_APP_API_URL=https://defi-advisor-api.onrender.com/api
```

2. Build your frontend with the production environment:
```bash
npm run build
```

## Optimizing for Render's Free Tier

The free tier has some limitations, so here are tips to optimize your backend:

1. **Implement caching** for blockchain requests to reduce API calls
2. **Add timeouts** to all external API calls to prevent hanging requests
3. **Use fallback data** when API calls fail or timeout
4. **Optimize payload sizes** to reduce bandwidth
5. **Set up health checks** to monitor your service

### Example Caching Implementation

```javascript
// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData(key, fetchFunction) {
  const cachedItem = cache.get(key);
  
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
    return Promise.resolve(cachedItem.data);
  }
  
  return fetchFunction().then(data => {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
    return data;
  });
}

// Usage example
router.get('/market', async (req, res) => {
  try {
    const marketData = await getCachedData('market', async () => {
      const ethPrice = await ethClient.getEthPrice();
      const gasPrice = await ethClient.getGasPrice();
      const marketTrend = await ethClient.getMarketTrend();
      const protocolData = await ethClient.getAllProtocolData();
      
      return {
        ethPrice,
        gasPrice,
        marketTrend,
        protocolData
      };
    });
    
    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    // Error handling
  }
});
```

## Monitoring and Maintenance

- **Check logs regularly** in the Render dashboard
- **Set up uptime monitoring** using a service like UptimeRobot (free tier available)
- **Monitor your API usage** on Alchemy and Etherscan dashboards
- **Update your API keys** if you approach free tier limits

## Automatic Deployment

Render automatically deploys when you push to your connected GitHub repository. To disable this:

1. Go to your Web Service settings
2. Under "Build & Deploy", toggle off "Auto-Deploy"

This allows you to control when deployments happen.