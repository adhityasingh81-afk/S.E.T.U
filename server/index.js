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

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.originalUrl} not found`
  });
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

export default app;
