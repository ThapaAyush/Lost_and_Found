import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDB } from './config/db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import abuseReportRoutes from './routes/abuseReportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration for HTTP-only cookies
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = [clientOrigin, 'http://localhost:5173', 'http://localhost:5174'];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev flexible fallback
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// General rate limiter
app.use('/api', generalLimiter);

// Serve static uploads for local image storage fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'Lost & Found API',
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/reports', abuseReportRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server only when not imported as a test module
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[Lost & Found Server] Running on http://localhost:${PORT}`);
    });
  });
}

export default app;
