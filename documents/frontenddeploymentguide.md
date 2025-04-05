# Deploying Your DeFi Advisor Frontend to Vercel

This guide explains how to deploy the frontend of your Personalized DeFi Advisor to [Vercel](https://vercel.com/), which offers a generous free tier perfect for React applications.

## Prerequisites

- A GitHub repository containing your project
- Your backend already deployed (e.g., on Render)
- A Vercel account (free to create)

## Deployment Steps

### 1. Prepare Your Frontend for Deployment

1. Create a `vercel.json` file in the root of your frontend directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "src": "/static/(.*)", "dest": "/static/$1" },
    { "src": "/favicon.ico", "dest": "/favicon.ico" },
    { "src": "/asset-manifest.json", "dest": "/asset-manifest.json" },
    { "src": "/manifest.json", "dest": "/manifest.json" },
    { "src": "/service-worker.js", "headers": { "cache-control": "s-maxage=0" }, "dest": "/service-worker.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

2. Create a `.env.production` file in your frontend directory:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

3. Commit and push these changes to your GitHub repository.

### 2. Deploy to Vercel

#### Option 1: Deploy via Vercel UI

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Choose GitHub as your Git provider
4. Authorize Vercel to access your GitHub account
5. Select your repository
6. Configure the deployment:
   - **Framework Preset**: React (or select "Other" if not automatically detected)
   - **Root Directory**: frontend (if your frontend is in a subdirectory)
   - **Build Command**: npm run build (or your custom build command)
   - **Output Directory**: build
7. Click "Deploy"

#### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. From your frontend directory, run:
```bash
vercel
```

4. Follow the prompts:
   - Link to an existing project or create a new one
   - Confirm the settings for your deployment
   - Wait for the deployment to complete

5. When you're ready for production:
```bash
vercel --prod
```

### 3. Configure Environment Variables

1. Go to your project settings in the Vercel dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add your environment variables:
   - `REACT_APP_API_URL`: Your backend API URL
4. Specify which environments (Production, Preview, Development) each variable applies to

### 4. Set Up Continuous Deployment

Vercel automatically sets up continuous deployment from your connected Git repository. When you push changes to your chosen branch, Vercel will automatically rebuild and deploy your site.

To customize this behavior:
1. Go to your project settings in the Vercel dashboard
2. Navigate to "Git"
3. Adjust the deployment settings as needed

### 5. Configure Custom Domain (Optional)

1. Go to your project settings in the Vercel dashboard
2. Navigate to "Domains"
3. Click "Add" to add your custom domain
4. Follow the instructions to set up your domain

## Optimizing Your Frontend for Vercel

1. **Enable asset optimization**:
   - Vercel automatically optimizes your assets by default
   - Configure additional options in your `vercel.json` file as needed

2. **Use code splitting** in your React app to reduce initial load time:
```javascript
import React, { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Strategy = lazy(() => import('./pages/Strategy'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/strategy" component={Strategy} />
      </Router>
    </Suspense>
  );
}
```

3. **Preconnect to your API** in index.html:
```html
<link rel="preconnect" href="https://your-backend-url.onrender.com">
```

4. **Add a service worker** for better offline experience and caching

## Setting Up Web3 With Vercel

Since your DeFi Advisor integrates with Web3 wallets, make sure to:

1. **Add security headers** for connecting to Web3 wallets:
   
Add to your vercel.json:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "connect-src 'self' https: wss: data: blob:;"
        }
      ]
    }
  ]
}
```

2. **Test wallet connections** thoroughly after deployment
   
3. **Consider using Web3Modal** for better wallet connection UX

## Monitoring and Analytics

1. **Use Vercel Analytics** for performance monitoring
2. **Monitor performance** with Lighthouse or WebPageTest
3. **Set up error tracking** with Sentry or similar services

## Troubleshooting Common Issues

1. **404 errors when refreshing routes**: This should be fixed by the route configuration in vercel.json
2. **Environment variables not working**: Make sure they're prefixed with REACT_APP_ for Create React App projects
3. **Build failures**: Check the build logs in the Vercel dashboard for specific errors
4. **CORS issues**: Ensure your backend has proper CORS headers for your Vercel domain

## Going Further

1. **Use Preview Deployments** for testing new features before merging to main
2. **Integrate with Vercel Functions** for lightweight serverless backends
3. **Set up A/B testing** with different preview deployments
4. **Utilize Vercel Edge Functions** for region-specific functionality
