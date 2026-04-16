import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './src/routes/authRoutes.js';
import expenseRoutes from './src/routes/expenseRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.status(200).json({ 
    status: 'OK', 
    database: dbStatus[dbState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Tracker API',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection - FIXED VERSION
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error(' MONGODB_URI is not defined');
    return false;
  }

  console.log(' Connecting to MongoDB...');
  
  // Simple options without deprecated parameters
  const options = {
    serverSelectionTimeoutMS: 5000,
    family: 4, // Force IPv4
  };
  
  try {
    await mongoose.connect(mongoURI, options);
    console.log(' Connected to MongoDB successfully!');
    console.log(` Database: ${mongoose.connection.db.databaseName}`);
    return true;
  } catch (error) {
    console.error(' Connection error:', error.message);
    return false;
  }
};

// Connect to database
connectDB();

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error(' MongoDB error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log(' MongoDB disconnected');
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    console.log(` API URL: http://localhost:${PORT}\n`);
  });
}

export default app;