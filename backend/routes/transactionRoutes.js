import express from 'express';
import {
  getTransactions,
  getTransactionSummary,
  getTransactionAnalytics,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

/**
 * Route: /api/transactions/summary
 * - GET: Fetch dynamic financial summary for a month using MongoDB aggregation
 * (Must be declared before /:id)
 */
router.get('/summary', getTransactionSummary);

/**
 * Route: /api/transactions/analytics
 * - GET: Fetch category expense breakdown and 6-month trend using MongoDB aggregation
 * (Must be declared before /:id)
 */
router.get('/analytics', getTransactionAnalytics);

/**
 * Route: /api/transactions
 * - GET: Fetch transactions (supports ?month=YYYY-MM and ?limit=N)
 * - POST: Create a new transaction
 */
router.route('/')
  .get(getTransactions)
  .post(createTransaction);

/**
 * Route: /api/transactions/:id
 * - PUT: Update an existing transaction
 * - DELETE: Delete a transaction
 */
router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
