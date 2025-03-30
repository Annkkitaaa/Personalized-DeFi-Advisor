const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const swagger = require('./swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set server timeouts - Increase to handle long-running blockchain operations
app.use((req, res, next) => {
  // Set the timeout for the response to 55 seconds
  req.setTimeout(55000); 
  res.setTimeout(55000);
  next();
});

// Add request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} started`);
  
  // Log when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} completed in ${duration}ms with status ${res.statusCode}`);
  });
  
  // Log when request is aborted
  req.on('aborted', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} aborted after ${duration}ms`);
  });
  
  next();
});

// API routes
app.use('/api', routes);

// Swagger documentation
app.use('/docs', swagger.serve, swagger.setup);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'DeFi Advisor API is running', docs: '/docs' });
});

// Better error handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.url}:`, err);
  
  // Send appropriate error based on type
  if (err.name === 'TimeoutError' || err.code === 'ETIMEDOUT') {
    return res.status(504).json({
      success: false,
      error: 'Request timed out. Please try again.'
    });
  }
  
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Server error',
    code: err.code || 'INTERNAL_SERVER_ERROR'
  });
});

// Export the app
module.exports = app;