import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Tag,
  CreditCard,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import './RecentTransactions.css';

/**
 * Format currency to Indian Rupee (INR) with 2 decimal places
 */
function formatCurrency(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Format ISO date string into readable format (e.g. 15 Oct 2026)
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format YYYY-MM into readable month name (e.g., "October 2026")
 */
function formatMonthName(monthStr) {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1));
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/**
 * RecentTransactions Component
 * 
 * Renders the live transaction table with loading, error, empty states,
 * and individual Edit / Delete actions.
 */
function RecentTransactions({
  transactions = [],
  selectedMonth = '',
  isFullView = false,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
  onViewAll
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const monthLabel = formatMonthName(selectedMonth);

  const handleDeleteClick = (tx) => {
    setConfirmDeleteId(tx._id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <section className="transactions-section" aria-label="Transactions List">
      <div className="transactions-card">
        {/* Header */}
        <div className="transactions-header">
          <div className="transactions-title-group">
            <h2 className="transactions-heading">
              {isFullView ? 'All Transactions' : 'Recent Transactions'}
            </h2>
            <span className="transactions-subtitle">
              {isFullView
                ? `Showing records for ${monthLabel || 'selected period'} (${transactions.length} total)`
                : `Showing latest ${transactions.length} entries for ${monthLabel || 'this month'}`}
            </span>
          </div>

          <div className="header-badge-group">
            {!isFullView && onViewAll && (
              <button 
                type="button" 
                className="btn-view-all"
                onClick={onViewAll}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            )}

            <div className="transactions-status-tag live-badge">
              <span className="live-dot"></span>
              <span>Live Database</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="transactions-state-container">
            <Loader2 size={24} className="spinner-icon" />
            <p className="state-text">Loading transactions from database...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="transactions-state-container error-state">
            <AlertCircle size={24} className="state-error-icon" />
            <div className="state-text-group">
              <p className="state-error-title">Failed to load transactions</p>
              <p className="state-error-desc">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && transactions.length === 0 && (
          <div className="transactions-state-container empty-state">
            <div className="empty-icon-wrap">
              <Tag size={28} />
            </div>
            <p className="empty-title">No transactions recorded for {monthLabel || 'this period'}</p>
            <p className="empty-subtitle">
              Click the "Add Transaction" button above to log your first income or expense entry for {monthLabel || 'this month'}.
            </p>
          </div>
        )}

        {/* Table when transactions exist */}
        {!isLoading && !error && transactions.length > 0 && (
          <div className="table-responsive-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th scope="col">Transaction</th>
                  <th scope="col">Type</th>
                  <th scope="col">Category</th>
                  <th scope="col">Date</th>
                  <th scope="col">Method</th>
                  <th scope="col" className="text-right">Amount</th>
                  <th scope="col" className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx._id} className="transaction-row">
                      {/* Details (Title + Note) */}
                      <td className="cell-details">
                        <div className="tx-lead">
                          <div className={`tx-icon-pill ${isIncome ? 'income' : 'expense'}`}>
                            {isIncome ? (
                              <ArrowUpRight size={15} />
                            ) : (
                              <ArrowDownLeft size={15} />
                            )}
                          </div>
                          <div className="tx-info">
                            <span className="tx-desc">{tx.title}</span>
                            {tx.note && <span className="tx-note">{tx.note}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="cell-type">
                        <span className={`type-badge-pill ${isIncome ? 'type-income' : 'type-expense'}`}>
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="cell-category">
                        <span className="category-badge">
                          <Tag size={12} className="cat-icon" />
                          {tx.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="cell-date">
                        <span className="date-text">{formatDate(tx.date)}</span>
                      </td>

                      {/* Payment Method */}
                      <td className="cell-method">
                        <span className="method-pill">
                          <CreditCard size={12} className="method-icon" />
                          {tx.paymentMethod || 'Cash'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="cell-amount text-right">
                        <span className={`amount-value ${isIncome ? 'income-val' : 'expense-val'}`}>
                          {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                        </span>
                      </td>

                      {/* Action Buttons (Edit / Delete) */}
                      <td className="cell-actions text-center">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn-action btn-edit"
                            onClick={() => onEdit(tx)}
                            title="Edit transaction"
                            aria-label={`Edit ${tx.title}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteClick(tx)}
                            title="Delete transaction"
                            aria-label={`Delete ${tx.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="delete-dialog-overlay" onClick={handleCancelDelete} role="dialog" aria-modal="true">
          <div className="delete-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <div className="delete-warning-icon">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="delete-dialog-title">Delete Transaction</h3>
                <p className="delete-dialog-text">
                  Are you sure you want to delete this transaction from MongoDB? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="delete-dialog-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RecentTransactions;
