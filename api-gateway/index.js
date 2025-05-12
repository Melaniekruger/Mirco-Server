const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON body BEFORE proxy
app.use(express.json());

// Debug: log requests
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.url}`);
  next();
});

// Proxy /auth to backend
app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/api/auth'  // Example: /auth/register → /api/auth/register
  },
  onProxyReq: (proxyReq, req, res) => {
    // You no longer need to manually write the body
    console.log(`[Gateway Proxy] ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('[Gateway Proxy Error]', err.message);
    res.status(500).json({ error: 'Proxy failed' });
  }
}));

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
