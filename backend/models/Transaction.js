import mongoose from 'mongoose';

/**
 * Transaction Schema
 * 
 * Defines the database schema for income and expense transactions.
 * Includes field-level validation and descriptive error messages.
 */
const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be a positive number greater than 0']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either "income" or "expense"'
      },
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Cash'
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Optional index for faster date-based queries
transactionSchema.index({ date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
