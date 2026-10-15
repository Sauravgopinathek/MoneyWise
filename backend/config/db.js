import mongoose from 'mongoose';

/**
 * Connect to MongoDB Database
 * 
 * Safe connection establishment using Mongoose.
 * Sanitizes errors to prevent credential leakage.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Database connection error: MONGO_URI is not defined in the environment variables.');
    throw new Error('MONGO_URI is missing. Please define it in your backend/.env file.');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected successfully: host = ${conn.connection.host}, database = ${conn.connection.name}`);
    return conn;
  } catch (error) {
    // Log the error message safely without printing the entire connection string
    console.error(`MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};
