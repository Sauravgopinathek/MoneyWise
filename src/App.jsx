import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import RecentTransactions from './components/RecentTransactions';
import TransactionModal from './components/TransactionModal';
import {
  getTransactions,
  getTransactionSummary,
  getTransactionAnalytics,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from './services/api';
import './App.css';

/**
 * Helper to get the current calendar month in YYYY-MM format
 */
function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format YYYY-MM into a friendly month string (e.g., "October 2026")
 */
function formatMonthDisplay(monthStr) {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return monthStr || 'Selected Month';
  const [year, month] = monthStr.split('-');
  const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1));
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/**
 * MoneyWise Main Application Container
 * 
 * Module 5: Charts and Spending Analytics
 */
function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme state: dark / light mode (persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('moneywise_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('moneywise_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Selected calendar month for reporting (default: current month)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  // Financial summary state from MongoDB aggregation
  const [summary, setSummary] = useState({
    month: getCurrentMonth(),
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // Analytics data state (category breakdown + 6-month trend + summary)
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Transactions list state
  const [transactions, setTransactions] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  // Modal and editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // User notification banner
  const [feedback, setFeedback] = useState(null);

  // Ref to track latest request sequence to prevent race conditions
  const latestRequestRef = useRef(0);

  /**
   * Temporary feedback banner helper
   */
  const showFeedback = useCallback((message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  }, []);

  /**
   * Fetch summary, analytics, and transactions concurrently for the selected month
   */
  const loadDashboardData = useCallback(async (month, tab) => {
    const requestId = ++latestRequestRef.current;

    setIsSummaryLoading(true);
    setIsTransactionsLoading(true);
    setIsAnalyticsLoading(true);
    setSummaryError(null);
    setTransactionsError(null);
    setAnalyticsError(null);

    try {
      // In Dashboard view, limit recent transactions to 5; in Transactions tab, fetch all for the month
      const transactionParams = tab === 'Dashboard'
        ? { month, limit: 5 }
        : { month };

      const [summaryRes, transactionsRes, analyticsRes] = await Promise.all([
        getTransactionSummary(month),
        getTransactions(transactionParams),
        getTransactionAnalytics(month)
      ]);

      // Guard against race conditions: only update if this is the newest request
      if (requestId === latestRequestRef.current) {
        setSummary(summaryRes);
        setTransactions(Array.isArray(transactionsRes) ? transactionsRes : []);
        setAnalyticsData(analyticsRes);
      }
    } catch (err) {
      if (requestId === latestRequestRef.current) {
        console.error('Failed to load dashboard data:', err);
        setSummaryError(err.message || 'Failed to fetch financial summary from database.');
        setTransactionsError(err.message || 'Failed to fetch transactions from database.');
        setAnalyticsError(err.message || 'Failed to fetch spending analytics.');
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsSummaryLoading(false);
        setIsTransactionsLoading(false);
        setIsAnalyticsLoading(false);
      }
    }
  }, []);

  // Reload data whenever selectedMonth or activeTab changes
  useEffect(() => {
    loadDashboardData(selectedMonth, activeTab);
  }, [selectedMonth, activeTab, loadDashboardData]);

  /**
   * Handle modal submission (Create or Update)
   */
  const handleModalSubmit = async (formData, id) => {
    if (id) {
      await updateTransaction(id, formData);
      showFeedback('Transaction updated successfully in database.', 'success');
    } else {
      await createTransaction(formData);
      showFeedback('Transaction created and saved to database.', 'success');
    }

    // If the transaction's month differs from selectedMonth, switch month to show the entry
    if (formData.date) {
      const txMonth = String(formData.date).slice(0, 7);
      if (txMonth && txMonth !== selectedMonth) {
        setSelectedMonth(txMonth);
        return;
      }
    }

    await loadDashboardData(selectedMonth, activeTab);
  };

  /**
   * Handle transaction deletion
   */
  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(id);
      showFeedback('Transaction deleted from database.', 'success');
      await loadDashboardData(selectedMonth, activeTab);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      showFeedback(err.message || 'Failed to delete transaction.', 'error');
      throw err;
    }
  };

  // Determine dynamic subtitle based on active navigation tab
  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'Analytics':
        return `Charts and spending distribution for ${selectedMonth} based on recorded transactions.`;
      case 'Transactions':
        return `Complete transaction history and record management for ${selectedMonth}.`;
      case 'Settings':
        return 'Application preferences, user profile, data export, and system diagnostics.';
      default:
        return 'Real-time financial summaries and recent transactions from MongoDB.';
    }
  };

  return (
    <div className="app-container">
      {/* Primary Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header 
          title={activeTab === 'Analytics' ? 'Spending Analytics' : activeTab}
          subtitle={getPageSubtitle()}
          selectedMonth={activeTab === 'Settings' ? null : selectedMonth}
          onChangeMonth={(newMonth) => setSelectedMonth(newMonth)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onAddTransaction={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
        />

        {/* Global Feedback Notice Banner */}
        {feedback && (
          <div className={`notice-banner ${feedback.type === 'error' ? 'notice-error' : ''}`} role="status">
            <span className="notice-dot"></span>
            <span className="notice-text">{feedback.message}</span>
            <button 
              type="button" 
              className="notice-close" 
              onClick={() => setFeedback(null)}
              aria-label="Dismiss notice"
            >
              ×
            </button>
          </div>
        )}

        <main className="dashboard-content">
          <div className="content-container">
            {/* VIEW 1: DASHBOARD TAB */}
            {activeTab === 'Dashboard' && (
              <>
                <SummaryCards 
                  summary={summary}
                  isLoading={isSummaryLoading}
                  error={summaryError}
                />

                {/* Explicit indicator when the selected month has zero records in MongoDB */}
                {summary.transactionCount === 0 && !isSummaryLoading && !summaryError && (
                  <div className="zero-data-banner" role="status">
                    <span className="zero-data-icon">ℹ️</span>
                    <div className="zero-data-text">
                      <strong>No transactions recorded for {formatMonthDisplay(selectedMonth)}.</strong>
                      <span>
                        Summary cards show ₹0.00 directly calculated from MongoDB. Click <strong>+ Add Transaction</strong> to record new entries, or switch months above to view historical data.
                      </span>
                    </div>
                  </div>
                )}

                {/* Live Analytics preview on Dashboard */}
                <Analytics 
                  analyticsData={analyticsData}
                  selectedMonth={selectedMonth}
                  theme={theme}
                  isLoading={isAnalyticsLoading}
                  error={analyticsError}
                />

                <RecentTransactions 
                  transactions={transactions}
                  selectedMonth={selectedMonth}
                  isFullView={false}
                  isLoading={isTransactionsLoading}
                  error={transactionsError}
                  onEdit={(tx) => {
                    setEditingTransaction(tx);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteTransaction}
                  onViewAll={() => setActiveTab('Transactions')}
                />
              </>
            )}

            {/* VIEW 2: ANALYTICS TAB */}
            {activeTab === 'Analytics' && (
              <Analytics 
                analyticsData={analyticsData}
                selectedMonth={selectedMonth}
                theme={theme}
                isLoading={isAnalyticsLoading}
                error={analyticsError}
              />
            )}

            {/* VIEW 3: TRANSACTIONS TAB */}
            {activeTab === 'Transactions' && (
              <RecentTransactions 
                transactions={transactions}
                selectedMonth={selectedMonth}
                isFullView={true}
                isLoading={isTransactionsLoading}
                error={transactionsError}
                onEdit={(tx) => {
                  setEditingTransaction(tx);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteTransaction}
              />
            )}

            {/* VIEW 4: SETTINGS TAB */}
            {activeTab === 'Settings' && (
              <Settings 
                transactions={transactions}
                currentTheme={theme}
                onToggleTheme={toggleTheme}
                onSettingsSaved={() => showFeedback('Settings preferences saved successfully.', 'success')}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingTransaction}
      />
    </div>
  );
}

export default App;
