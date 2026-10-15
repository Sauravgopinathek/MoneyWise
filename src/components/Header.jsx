import React from 'react';
import { Plus, Menu, Calendar, Sun, Moon } from 'lucide-react';
import './Header.css';

/**
 * Format YYYY-MM into a friendly string (e.g., "October 2026")
 */
function formatMonthDisplay(monthStr) {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return monthStr;
  const [year, month] = monthStr.split('-');
  const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1));
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/**
 * Header Component
 * 
 * Displays page title, subtitle, interactive month filter selector,
 * dark/light theme switch button, mobile menu toggle, and primary "Add Transaction" button.
 */
function Header({ 
  title = "Dashboard", 
  subtitle = "Overview of your personal income, expenses, and financial health.",
  selectedMonth,
  onChangeMonth,
  theme = 'light',
  onToggleTheme,
  onToggleSidebar,
  onAddTransaction
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          type="button" 
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-group">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Month Selector Control */}
        {selectedMonth && onChangeMonth && (
          <div className="month-selector-wrapper" title={`Current Reporting Period: ${formatMonthDisplay(selectedMonth)}`}>
            <Calendar size={15} className="calendar-icon" />
            <input 
              type="month"
              id="header-month-picker"
              className="month-picker-input"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) {
                  onChangeMonth(e.target.value);
                }
              }}
              aria-label="Select reporting month"
            />
          </div>
        )}

        {/* Dark / Light Mode Switch Toggle */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun size={17} className="theme-icon sun-icon" />
          ) : (
            <Moon size={17} className="theme-icon moon-icon" />
          )}
        </button>

        <button 
          type="button" 
          className="btn-primary add-transaction-btn"
          onClick={onAddTransaction}
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
