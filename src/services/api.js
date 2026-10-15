/**
 * API Service for MoneyWise
 * 
 * Centralized fetch helper for communicating with the Express backend REST API.
 * Uses VITE_API_BASE_URL with a local development fallback.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Helper to handle fetch responses and standardize errors
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let errorMessage = 'An error occurred with the request.';
    if (data) {
      if (data.details && Array.isArray(data.details)) {
        errorMessage = data.details.join(' ');
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else {
      errorMessage = `Server returned status ${response.status}: ${response.statusText}`;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * GET /api/transactions
 * Fetch transactions from MongoDB (supports optional { month, limit } filtering)
 */
export async function getTransactions(params = {}) {
  const query = new URLSearchParams();
  if (params.month) query.set('month', params.month);
  if (params.limit) query.set('limit', params.limit);
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const response = await fetch(`${API_BASE_URL}/api/transactions${queryString}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
}

/**
 * GET /api/transactions/summary?month=YYYY-MM
 * Fetch aggregated financial summary for a given calendar month
 */
export async function getTransactionSummary(month) {
  if (!month) {
    throw new Error('A month parameter in YYYY-MM format is required.');
  }

  const response = await fetch(`${API_BASE_URL}/api/transactions/summary?month=${encodeURIComponent(month)}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
}

/**
 * GET /api/transactions/analytics?month=YYYY-MM
 * Fetch spending analytics (category breakdown, 6-month trend, and monthly summary)
 */
export async function getTransactionAnalytics(month) {
  if (!month) {
    throw new Error('A month parameter in YYYY-MM format is required.');
  }

  const response = await fetch(`${API_BASE_URL}/api/transactions/analytics?month=${encodeURIComponent(month)}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
}

/**
 * POST /api/transactions
 * Create a new transaction in MongoDB
 */
export async function createTransaction(transactionData) {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(transactionData)
  });
  return handleResponse(response);
}

/**
 * PUT /api/transactions/:id
 * Update an existing transaction in MongoDB
 */
export async function updateTransaction(id, transactionData) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(transactionData)
  });
  return handleResponse(response);
}

/**
 * DELETE /api/transactions/:id
 * Delete a transaction from MongoDB
 */
export async function deleteTransaction(id) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
}
