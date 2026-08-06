require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const app = express();
const prisma = new PrismaClient();

// Middleware
// CORS — allow the deployed frontend (FRONTEND_URL), local dev, and Vercel previews.
// Trailing slashes are stripped so "https://app.vercel.app/" matches the browser origin.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Strip trailing slashes ("https://app.vercel.app/" → "https://app.vercel.app")
      const normalized = origin ? origin.replace(/\/+$/, '') : origin;
      // No origin (curl, server-to-server) → allow. Known origin or Vercel preview → allow.
      if (!normalized || allowedOrigins.includes(normalized) || normalized.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/series', require('./routes/series'));
app.use('/api/people', require('./routes/people'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/search', require('./routes/search'));
app.use('/api/media', require('./routes/media'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/languages', require('./routes/languages'));
app.use('/api/follows', require('./routes/follows'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/recommendations', require('./routes/recommendations'));

// Root — friendly landing for the API base URL
app.get('/', (_req, res) => {
  res.json({
    name: 'CineVault API',
    version: '1.0.0',
    status: 'ok',
    endpoints: '/api',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 — JSON response for unknown routes (instead of Express's default HTML)
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://0.0.0.0:${PORT}`));

module.exports = { app, prisma };
