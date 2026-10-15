import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Resolve directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();

// Middleware: Enable CORS for Vite frontend
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware: Parse incoming JSON requests
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MoneyWise API is running',
    timestamp: new Date().toISOString()
  });
});

// Transaction Routes
app.use('/api/transactions', transactionRoutes);

// Catch-all 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.name || 'ApplicationError'}: ${err.message}`);

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map(item => item.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: errorMessages
    });
  }

  // Handle Invalid MongoDB ObjectIds (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: `Invalid format for resource ID: ${err.value}`
    });
  }

  // Fallback to 500 Internal Server Error
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: 'Server Error',
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

/**
 * Start Server
 * Enforces requirement: Listen for requests only after MongoDB connects successfully
 */
export const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`MoneyWise API server running on port ${PORT}`);
    });
    return server;
  } catch (error) {
    console.error('Server startup aborted: Unable to connect to MongoDB.');
    console.error('Please configure a valid MONGO_URI in backend/.env');
  }
};

// Auto-start when executed directly from node or nodemon
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
