import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PORT, NODE_ENV } from './config.js';

import simulationRoutes from './routes/simulationRoutes.js';
import recoveryRoutes from './routes/recoveryRoutes.js';
import resilienceRoutes from './routes/resilienceRoutes.js';
import negotiationRoutes from './routes/negotiationRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import databaseRoutes from './routes/databaseRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import { initDatabase } from './db/database.js';

// Initialize SQLite database & migrations
initDatabase();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root & Healthcheck API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NEXUS Autonomous Supply Chain API Server',
    database: 'SQLite (Node 24 DatabaseSync)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register API Routes
app.use('/api/simulate', simulationRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/resilience', resilienceRoutes);
app.use('/api/negotiation', negotiationRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/db', databaseRoutes);
app.use('/api/sos', sosRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Serve static frontend bundle in production
app.use(express.static(distPath));

// API 404 Route Handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.originalUrl} not found`
  });
});

// SPA Fallback: send index.html for all client routes
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(` 🚀 NEXUS Backend API Server Running on port ${PORT}`);
  console.log(` 📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`========================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please check if another process is running or set PORT in environment.`);
  } else {
    console.error('❌ Server startup error:', err);
  }
  process.exit(1);
});

export default app;
