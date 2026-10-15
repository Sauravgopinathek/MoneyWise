import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  Database,
  Download,
  CheckCircle2,
  Server,
  Save,
  RotateCcw,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import './Settings.css';

const DEFAULT_SETTINGS = {
  userName: 'Saurav Gopinath',
  email: 'saurav@example.com',
  currency: 'INR',
  defaultPaymentMethod: 'UPI',
  defaultType: 'expense',
  monthlyBudgetTarget: 30000
};

/**
 * Settings Component
 * 
 * Provides general user preferences, currency configuration,
 * system connection diagnostics, theme toggle, and CSV/JSON data backup export.
 */
function Settings({
  transactions = [],
  currentTheme = 'light',
  onToggleTheme,
  onSettingsSaved
}) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('moneywise_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [apiHealth, setApiHealth] = useState({ status: 'checking', message: 'Checking backend API...' });

  // Test backend API health when Settings mounts
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/health');
        const data = await res.json();
        if (res.ok && data.status === 'ok') {
          setApiHealth({ status: 'online', message: 'Connected & Operational (200 OK)' });
        } else {
          setApiHealth({ status: 'warning', message: 'Backend responded with non-200 status' });
        }
      } catch (err) {
        setApiHealth({ status: 'offline', message: 'Backend unreachable on port 5000' });
      }
    };
    checkBackend();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('moneywise_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    if (onSettingsSaved) {
      onSettingsSaved(settings);
    }
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('moneywise_settings', JSON.stringify(DEFAULT_SETTINGS));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  /**
   * Export all transactions as a CSV file
   */
  const handleExportCSV = () => {
    if (!transactions.length) {
      alert('No transactions available to export.');
      return;
    }

    const headers = ['ID', 'Title', 'Type', 'Category', 'Amount', 'Date', 'PaymentMethod', 'Note'];
    const rows = transactions.map((t) => [
      t._id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      new Date(t.date).toISOString().split('T')[0],
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `moneywise_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Export all transactions as JSON file
   */
  const handleExportJSON = () => {
    if (!transactions.length) {
      alert('No transactions available to export.');
      return;
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(transactions, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `moneywise_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="settings-container">
      {savedSuccess && (
        <div className="settings-alert-banner">
          <CheckCircle2 size={16} />
          <span>Your preferences have been saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form">
        {/* Section 1: User Profile */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-icon">
              <User size={18} />
            </div>
            <div>
              <h3 className="settings-section-title">User Profile</h3>
              <p className="settings-section-sub">Personalize your name and contact details</p>
            </div>
          </div>

          <div className="settings-fields-grid">
            <div className="form-group">
              <label htmlFor="settings-userName" className="form-label">Full Name</label>
              <input
                id="settings-userName"
                name="userName"
                type="text"
                className="form-input"
                value={settings.userName}
                onChange={handleChange}
                placeholder="e.g. Saurav Gopinath"
              />
            </div>

            <div className="form-group">
              <label htmlFor="settings-email" className="form-label">Email Address</label>
              <input
                id="settings-email"
                name="email"
                type="email"
                className="form-input"
                value={settings.email}
                onChange={handleChange}
                placeholder="e.g. student@college.edu"
              />
            </div>

            <div className="form-group">
              <label htmlFor="settings-budget" className="form-label">Monthly Target Budget (₹)</label>
              <input
                id="settings-budget"
                name="monthlyBudgetTarget"
                type="number"
                className="form-input"
                value={settings.monthlyBudgetTarget}
                onChange={handleChange}
                placeholder="30000"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Application Preferences */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-icon">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="settings-section-title">Preferences & Defaults</h3>
              <p className="settings-section-sub">Configure currency representation and transaction form defaults</p>
            </div>
          </div>

          <div className="settings-fields-grid">
            <div className="form-group">
              <label htmlFor="settings-currency" className="form-label">Display Currency</label>
              <select
                id="settings-currency"
                name="currency"
                className="form-select"
                value={settings.currency}
                onChange={handleChange}
              >
                <option value="INR">Indian Rupee (₹ - INR)</option>
                <option value="USD">US Dollar ($ - USD)</option>
                <option value="EUR">Euro (€ - EUR)</option>
                <option value="GBP">British Pound (£ - GBP)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="settings-method" className="form-label">Default Payment Method</label>
              <select
                id="settings-method"
                name="defaultPaymentMethod"
                className="form-select"
                value={settings.defaultPaymentMethod}
                onChange={handleChange}
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="settings-type" className="form-label">Default Transaction Type</label>
              <select
                id="settings-type"
                name="defaultType"
                className="form-select"
                value={settings.defaultType}
                onChange={handleChange}
              >
                <option value="expense">Expense (Outflow)</option>
                <option value="income">Income (Inflow)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Interface Theme</label>
              <div className="theme-toggle-options">
                <button
                  type="button"
                  className={`theme-option-btn ${currentTheme === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    if (currentTheme !== 'light' && onToggleTheme) onToggleTheme();
                  }}
                  aria-label="Light mode"
                >
                  <Sun size={15} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`theme-option-btn ${currentTheme === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    if (currentTheme !== 'dark' && onToggleTheme) onToggleTheme();
                  }}
                  aria-label="Dark mode"
                >
                  <Moon size={15} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          <div className="settings-action-bar">
            <button type="button" className="btn-secondary" onClick={handleReset}>
              <RotateCcw size={15} />
              <span>Reset Defaults</span>
            </button>
            <button type="submit" className="btn-primary">
              <Save size={15} />
              <span>Save Preferences</span>
            </button>
          </div>
        </section>
      </form>

      {/* Section 3: Data Backup & Export */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-header-icon">
            <Download size={18} />
          </div>
          <div>
            <h3 className="settings-section-title">Data Backup & Export</h3>
            <p className="settings-section-sub">Download your recorded financial records for offline review</p>
          </div>
        </div>

        <div className="backup-actions-grid">
          <div className="backup-box">
            <div className="backup-info">
              <h4 className="backup-title">Export as CSV Spreadsheet</h4>
              <p className="backup-desc">
                Export all {transactions.length} database transactions into a CSV file compatible with Microsoft Excel and Google Sheets.
              </p>
            </div>
            <button type="button" className="btn-secondary backup-btn" onClick={handleExportCSV}>
              <Download size={15} />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="backup-box">
            <div className="backup-info">
              <h4 className="backup-title">Backup as Raw JSON</h4>
              <p className="backup-desc">
                Export full structured JSON records with MongoDB document IDs, timestamps, and metadata.
              </p>
            </div>
            <button type="button" className="btn-secondary backup-btn" onClick={handleExportJSON}>
              <Download size={15} />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 4: System Diagnostics & Project Architecture */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-header-icon">
            <Database size={18} />
          </div>
          <div>
            <h3 className="settings-section-title">System & Database Architecture</h3>
            <p className="settings-section-sub">Real-time connection status and technical stack specifications</p>
          </div>
        </div>

        <div className="diagnostics-grid">
          <div className="diag-item">
            <span className="diag-label">API Health Status</span>
            <div className="diag-val-badge">
              <span className={`status-dot ${apiHealth.status}`}></span>
              <span>{apiHealth.message}</span>
            </div>
          </div>

          <div className="diag-item">
            <span className="diag-label">Database Target</span>
            <span className="diag-val">MongoDB (127.0.0.1:27017 / MoneyWise_db)</span>
          </div>

          <div className="diag-item">
            <span className="diag-label">Backend Server</span>
            <span className="diag-val">Express.js (Port 5000) with CORS Enabled</span>
          </div>

          <div className="diag-item">
            <span className="diag-label">Frontend Framework</span>
            <span className="diag-val">React 18 + Vite (ES Modules)</span>
          </div>

          <div className="diag-item">
            <span className="diag-label">Visualization Engine</span>
            <span className="diag-val">Recharts (SVG Responsive Charts)</span>
          </div>

          <div className="diag-item">
            <span className="diag-label">Evaluation Project</span>
            <span className="diag-val">MoneyWise — Personal Expense Tracker (20 Marks)</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Settings;
