const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import Database Config for Health Check
const sequelize = require('./config/database');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

const app = express();

// Security & logging middleware
app.use(helmet());

// CORS: allow only configured frontend (Docker uses http://frontend:3000)
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// Health Check (required: /api/health)
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health Check Failed:', error);
    return res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tenants', tenantRoutes);

// Global error handler with consistent shape
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

module.exports = app;