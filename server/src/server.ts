import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectDB } from './utils/database';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './services/socketService';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import friendRoutes from './routes/friends';
import bookingRoutes from './routes/bookings';
import messageRoutes from './routes/messages';
import paymentRoutes from './routes/payments';
import matchRoutes from './routes/matches';
import safetyRoutes from './routes/safety';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com", "wss:", "ws:"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"]
    }
  }
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/admin', adminRoutes);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message);
  // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

export { io };
