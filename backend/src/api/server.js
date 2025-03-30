const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const swagger = require('./swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Swagger documentation
app.use('/docs', swagger.serve, swagger.setup);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'DeFi Advisor API is running', docs: '/docs' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Server error' 
  });
});

module.exports = app;