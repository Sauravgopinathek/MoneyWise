import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Hash, Loader2, AlertCircle } from 'lucide-react';
import './SummaryCards.css';

/**
 * Format amounts cleanly into Indian Rupees (INR) with 2 decimal places
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
 * Format YYYY-MM into readable month name (e.g., "October 2026")
 */
function formatMonthName(monthStr) {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return 'Selected Month';
  const [year, month] = monthStr.split('-');
  const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1));
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/**
 * SummaryCards Component
 * 
 * Displays the 4 dynamic financial summary metrics from MongoDB aggregation:
 * 1. Current Balance
 * 2. Total Income
 * 3. Total Expenses
 * 4. Total Transactions
 */
function SummaryCards({
  summary = { totalIncome: 0, totalExpenses: 0, balance: 0, transactionCount: 0, month: '' },
  isLoading = false,
  error = null
}) {
  const monthName = formatMonthName(summary.month);

  const cards = [
    {
      id: 'balance',
      label: 'Current Balance',
      amount: formatCurrency(summary.balance),
      icon: Wallet,
      type: 'balance',
      subtitle: `Net balance for ${monthName}`
    },
    {
      id: 'income',
      label: 'Total Income',
      amount: formatCurrency(summary.totalIncome),
      icon: ArrowUpRight,
      type: 'income',
      subtitle: `Total inflows for ${monthName}`
    },
    {
      id: 'expenses',
      label: 'Total Expenses',
      amount: formatCurrency(summary.totalExpenses),
      icon: ArrowDownRight,
      type: 'expense',
      subtitle: `Total outflows for ${monthName}`
    },
    {
      id: 'count',
      label: 'Total Transactions',
      amount: Number(summary.transactionCount || 0).toLocaleString('en-IN'),
      icon: Hash,
      type: 'count',
      subtitle: `Entries logged in ${monthName}`
    }
  ];

  if (error) {
    return (
      <section className="summary-error-banner" aria-label="Financial Summary Error">
        <AlertCircle size={20} className="summary-error-icon" />
        <div>
          <h4 className="summary-error-title">Unable to calculate financial summary</h4>
          <p className="summary-error-msg">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="summary-cards-grid" aria-label="Monthly Financial Summary">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={`summary-card card-${card.type}`}>
            <div className="summary-card-header">
              <span className="summary-card-label">{card.label}</span>
              <div className={`summary-icon-badge badge-${card.type}`}>
                <Icon size={16} strokeWidth={2.2} />
              </div>
            </div>

            <div className="summary-card-body">
              {isLoading ? (
                <div className="summary-loading-placeholder">
                  <Loader2 size={18} className="spinner-icon" />
                  <span>Calculating...</span>
                </div>
              ) : (
                <span className={`summary-card-amount amount-${card.type}`}>
                  {card.amount}
                </span>
              )}
              <span className="summary-card-subtitle">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default SummaryCards;
