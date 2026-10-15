import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

/**
 * Validate YYYY-MM month format (e.g., '2026-10')
 */
const isValidMonthFormat = (monthStr) => {
  if (typeof monthStr !== 'string') return false;
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(monthStr);
};

/**
 * Compute UTC date range for a given YYYY-MM string
 */
const getMonthDateRange = (monthStr) => {
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthNumStr, 10) - 1; // 0-indexed for JavaScript Date

  const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));

  return { startDate, endDate };
};

/**
 * @desc    Fetch transactions, optionally filtered by month and/or limited
 * @route   GET /api/transactions
 * @access  Public
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { month, limit } = req.query;
    const filter = {};

    // Filter by month if provided
    if (month !== undefined) {
      if (!isValidMonthFormat(month)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid month format. Please use YYYY-MM (e.g., ?month=2026-10).'
        });
      }
      const { startDate, endDate } = getMonthDateRange(month);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    let query = Transaction.find(filter).sort({ date: -1, createdAt: -1 });

    // Limit count if specified
    if (limit !== undefined) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit);
      }
    }

    const transactions = await query;
    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dynamic financial summary for a specific calendar month
 * @route   GET /api/transactions/summary?month=YYYY-MM
 * @access  Public
 */
export const getTransactionSummary = async (req, res, next) => {
  try {
    const { month } = req.query;

    // Validate presence and format of month query parameter
    if (!month || !isValidMonthFormat(month)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'A valid month parameter in YYYY-MM format is required (e.g., ?month=2026-10).'
      });
    }

    const { startDate, endDate } = getMonthDateRange(month);

    // MongoDB Aggregation Pipeline: Filter by month and calculate totals
    const aggregationResult = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    // Format results with 2 decimal places precision and handle empty sets
    const rawData = aggregationResult.length > 0 
      ? aggregationResult[0] 
      : { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };

    const totalIncome = Math.round(Number(rawData.totalIncome || 0) * 100) / 100;
    const totalExpenses = Math.round(Number(rawData.totalExpenses || 0) * 100) / 100;
    const balance = Math.round((totalIncome - totalExpenses) * 100) / 100;
    const transactionCount = Number(rawData.transactionCount || 0);

    return res.status(200).json({
      month,
      totalIncome,
      totalExpenses,
      balance,
      transactionCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get spending analytics (category breakdown, 6-month trend, and monthly summary)
 * @route   GET /api/transactions/analytics?month=YYYY-MM
 * @access  Public
 */
export const getTransactionAnalytics = async (req, res, next) => {
  try {
    const { month } = req.query;

    // Validate presence and format of month query parameter
    if (!month || !isValidMonthFormat(month)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'A valid month parameter in YYYY-MM format is required (e.g., ?month=2026-10).'
      });
    }

    const { startDate, endDate } = getMonthDateRange(month);

    // 1. Category-wise expense breakdown for selected month
    const categoryAggregation = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $project: {
          amount: 1,
          cleanCategory: { $trim: { input: '$category' } }
        }
      },
      {
        $group: {
          _id: '$cleanCategory',
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    const totalExpenseSum = categoryAggregation.reduce((acc, curr) => acc + curr.total, 0);

    const categoryExpenses = categoryAggregation.map((cat) => {
      const roundedAmount = Math.round(cat.total * 100) / 100;
      const percentage = totalExpenseSum > 0 
        ? Math.round((cat.total / totalExpenseSum) * 10000) / 100 
        : 0;
      return {
        category: cat._id,
        amount: roundedAmount,
        percentage
      };
    });

    // 2. 6-Month Chronological Trend ending with selected month
    const [selYearStr, selMonthStr] = month.split('-');
    const selYear = parseInt(selYearStr, 10);
    const selMonth = parseInt(selMonthStr, 10);

    const sixMonthsList = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(selYear, selMonth - 1 - i, 1));
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const monthKey = `${y}-${m}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
      sixMonthsList.push({ month: monthKey, label });
    }

    const rangeStart = new Date(Date.UTC(selYear, selMonth - 6, 1, 0, 0, 0, 0));
    const rangeEnd = endDate;

    const trendAggregation = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: rangeStart, $lt: rangeEnd }
        }
      },
      {
        $group: {
          _id: {
            yearMonth: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const trendMap = {};
    for (const item of trendAggregation) {
      const ym = item._id.yearMonth;
      const type = item._id.type;
      if (!trendMap[ym]) {
        trendMap[ym] = { totalIncome: 0, totalExpenses: 0 };
      }
      if (type === 'income') {
        trendMap[ym].totalIncome += item.total;
      } else if (type === 'expense') {
        trendMap[ym].totalExpenses += item.total;
      }
    }

    const monthlyTrend = sixMonthsList.map((item) => ({
      month: item.month,
      label: item.label,
      totalIncome: Math.round((trendMap[item.month]?.totalIncome || 0) * 100) / 100,
      totalExpenses: Math.round((trendMap[item.month]?.totalExpenses || 0) * 100) / 100
    }));

    // 3. Monthly Summary for selected month
    const summaryAggregation = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const rawSummary = summaryAggregation.length > 0
      ? summaryAggregation[0]
      : { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };

    const totalIncome = Math.round(Number(rawSummary.totalIncome || 0) * 100) / 100;
    const totalExpenses = Math.round(Number(rawSummary.totalExpenses || 0) * 100) / 100;
    const balance = Math.round((totalIncome - totalExpenses) * 100) / 100;
    const transactionCount = Number(rawSummary.transactionCount || 0);

    return res.status(200).json({
      month,
      categoryExpenses,
      monthlyTrend,
      monthlySummary: {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount
      }
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Public
 */
export const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, paymentMethod, note } = req.body;

    const errors = [];

    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push('Transaction title is required.');
    }

    const parsedAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.push('Amount must be a positive number greater than 0.');
    }

    const normalizedType = typeof type === 'string' ? type.toLowerCase().trim() : '';
    if (!normalizedType || !['income', 'expense'].includes(normalizedType)) {
      errors.push('Transaction type must be either "income" or "expense".');
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      errors.push('Category is required.');
    }

    let parsedDate = new Date();
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid transaction date provided.');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors
      });
    }

    const newTransaction = await Transaction.create({
      title: title.trim(),
      amount: parsedAmount,
      type: normalizedType,
      category: category.trim(),
      date: parsedDate,
      paymentMethod: paymentMethod ? paymentMethod.trim() : 'Cash',
      note: note ? note.trim() : ''
    });

    return res.status(201).json(newTransaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing transaction
 * @route   PUT /api/transactions/:id
 * @access  Public
 */
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid transaction ID format.'
      });
    }

    const { title, amount, type, category, date, paymentMethod, note } = req.body;
    const errors = [];

    if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
      errors.push('Transaction title cannot be empty.');
    }

    let parsedAmount;
    if (amount !== undefined) {
      parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        errors.push('Amount must be a positive number greater than 0.');
      }
    }

    let normalizedType;
    if (type !== undefined) {
      normalizedType = typeof type === 'string' ? type.toLowerCase().trim() : '';
      if (!['income', 'expense'].includes(normalizedType)) {
        errors.push('Transaction type must be either "income" or "expense".');
      }
    }

    if (category !== undefined && (!category || typeof category !== 'string' || !category.trim())) {
      errors.push('Category cannot be empty.');
    }

    let parsedDate;
    if (date !== undefined) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid transaction date provided.');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (parsedAmount !== undefined) updateData.amount = parsedAmount;
    if (normalizedType !== undefined) updateData.type = normalizedType;
    if (category !== undefined) updateData.category = category.trim();
    if (parsedDate !== undefined) updateData.date = parsedDate;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod.trim();
    if (note !== undefined) updateData.note = note.trim();

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Transaction not found.'
      });
    }

    return res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction by ID
 * @route   DELETE /api/transactions/:id
 * @access  Public
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid transaction ID format.'
      });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Transaction not found.'
      });
    }

    return res.status(200).json({
      message: 'Transaction deleted successfully.',
      id: deletedTransaction._id
    });
  } catch (error) {
    next(error);
  }
};
