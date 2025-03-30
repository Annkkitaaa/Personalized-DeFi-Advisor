# Deploying Your DeFi Advisor Frontend to Netlify

This guide explains how to deploy the frontend of your Personalized DeFi Advisor to [Netlify](https://www.netlify.com/), which offers a generous free tier perfect for React applications.

## Prerequisites

- A GitHub repository containing your project
- Your backend already deployed (e.g., on Render)
- A Netlify account (free to create)

## Deployment Steps

### 1. Prepare Your Frontend for Deployment

1. Create a `netlify.toml` file in the root of your frontend directory:

```toml
[build]
  base = "/"
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Create a `.env.production` file in your frontend directory:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

3. Commit and push these changes to your GitHub repository.

### 2. Deploy to Netlify

#### Option 1: Deploy via Netlify UI

1. Log in to your [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Choose GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your repository
6. Configure the deployment:
   - **Branch to deploy**: main (or your default branch)
   - **Base directory**: frontend (if your frontend is in a subdirectory)
   - **Build command**: npm run build
   - **Publish directory**: build
7. Click "Deploy site"

#### Option 2: Deploy via Netlify CLI

1. Install the Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. From your frontend directory, run:
```bash
netlify deploy
```

4. Follow the prompts:
   - Create a new site or choose an existing one
   - Specify the build directory (`build`)
   - Preview the deployment

5. When you're ready for production:
```bash
netlify deploy --prod
```

### 3. Configure Environment Variables

1. Go to your site settings in the Netlify dashboard
2. Navigate to "Build & deploy" > "Environment"
3. Add your environment variables:
   - `REACT_APP_API_URL`: Your backend API URL

### 4. Set Up Continuous Deployment

Netlify automatically sets up continuous deployment from your connected Git repository. When you push changes to your chosen branch, Netlify will automatically rebuild and deploy your site.

To customize this behavior:
1. Go to your site settings in the Netlify dashboard
2. Navigate to "Build & deploy" > "Continuous Deployment"
3. Adjust the settings as needed

### 5. Configure Custom Domain (Optional)

1. Go to your site settings in the Netlify dashboard
2. Navigate to "Domain settings"
3. Click "Add custom domain"
4. Follow the instructions to set up your domain

## Optimizing Your Frontend for Netlify

1. **Enable asset optimization**:
   - Go to your site settings in the Netlify dashboard
   - Navigate to "Build & deploy" > "Post processing"
   - Enable asset optimization options

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

## Setting Up Web3 With Netlify

Since your DeFi Advisor integrates with Web3 wallets, make sure to:

1. **Add security headers** for connecting to Web3 wallets:
   
Add to your netlify.toml:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "connect-src 'self' https: wss: data: blob:;"
```

2. **Test wallet connections** thoroughly after deployment
   
3. **Consider using Web3Modal** for better wallet connection UX

## Monitoring and Analytics

1. **Add Netlify Analytics** (paid feature) or set up Google Analytics
2. **Monitor performance** with Lighthouse or WebPageTest
3. **Set up error tracking** with Sentry or similar services

## Troubleshooting Common Issues

1. **404 errors when refreshing routes**: This should be fixed by the redirect rule in the netlify.toml file
2. **Environment variables not working**: Make sure they're prefixed with REACT_APP_
3. **Build failures**: Check the build logs for specific errors
4. **CORS issues**: Ensure your backend has proper CORS headers for your Netlify domain

## Going Further

1. **Add a preview channel** for testing new features
2. **Set up A/B testing** with Netlify's split testing
3. **Implement Netlify forms** for user feedback
4. **Use Netlify Identity** for user authentication