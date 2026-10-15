import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  Loader2,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Scale
} from 'lucide-react';
import './Analytics.css';

/**
 * Format currency to Indian Rupees (INR) with 2 decimal places
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
 * Format compact currency for YAxis ticks (e.g., ₹25k)
 */
function formatCompactCurrency(amount) {
  const num = Number(amount || 0);
  if (Math.abs(num) >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
  return `₹${num}`;
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

// Restrained, professional color palette for pie chart slices
const CATEGORY_COLORS = [
  '#2d6a4f', // Forest green
  '#b91c1c', // Brick red
  '#1d4ed8', // Slate blue
  '#d97706', // Warm amber
  '#0f766e', // Deep teal
  '#7c3aed', // Soft violet
  '#475569', // Slate grey
  '#c026d3', // Magenta
  '#0284c7', // Sky blue
  '#ca8a04'  // Olive gold
];

/**
 * Custom Tooltip for Category Expense Pie Chart
 */
function CategoryPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-title">{data.category}</p>
        <p className="tooltip-value">
          <span className="tooltip-label">Amount: </span>
          <strong>{formatCurrency(data.amount)}</strong>
        </p>
        <p className="tooltip-sub">
          <span className="tooltip-label">Share: </span>
          {Number(data.percentage).toFixed(1)}% of total expenses
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Custom Tooltip for 6-Month Income vs Expense Bar Chart
 */
function TrendBarTooltip({ active, payload, label, selectedMonth }) {
  if (active && payload && payload.length) {
    const isSelectedMonth = payload[0]?.payload?.month === selectedMonth;
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-title">
          {label} {isSelectedMonth ? '★ (Selected Month)' : ''}
        </p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} className="tooltip-value" style={{ color: entry.color }}>
            <span className="tooltip-label">{entry.name}: </span>
            <strong>{formatCurrency(entry.value)}</strong>
          </p>
        ))}
        {isSelectedMonth && (
          <p className="tooltip-sub" style={{ marginTop: '4px' }}>
            Current reporting period
          </p>
        )}
      </div>
    );
  }
  return null;
}

/**
 * Analytics Page Component
 * 
 * Displays:
 * 1. Expenses by Category (Donut / Pie Chart)
 * 2. 6-Month Income vs Expenses (Bar Chart)
 * 3. Monthly Textual Summary & Insights
 */
function Analytics({
  analyticsData = null,
  selectedMonth = '',
  theme = 'light',
  isLoading = false,
  error = null
}) {
  const isDark = theme === 'dark';
  const monthName = formatMonthName(selectedMonth);

  if (isLoading) {
    return (
      <div className="analytics-state-card">
        <Loader2 size={28} className="spinner-icon" />
        <p className="state-text">Loading spending analytics for {monthName}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-state-card error-card">
        <AlertCircle size={28} className="state-error-icon" />
        <h3 className="state-error-title">Unable to load analytics</h3>
        <p className="state-error-desc">{error}</p>
      </div>
    );
  }

  const categoryExpenses = analyticsData?.categoryExpenses || [];
  const monthlyTrend = analyticsData?.monthlyTrend || [];
  const summary = analyticsData?.monthlySummary || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  };

  // Check if any month in the 6-month window has actual transaction records
  const hasAnyTrendData = monthlyTrend.some(
    (m) => (m.totalIncome || 0) > 0 || (m.totalExpenses || 0) > 0
  );

  // Find top spending category if expenses exist
  const topCategory = categoryExpenses.length > 0 ? categoryExpenses[0] : null;

  // Determine net financial status statement
  let statusStatement = '';
  if (summary.transactionCount === 0) {
    statusStatement = `No income or expense transactions were recorded for ${monthName}. Cards show ₹0.00 from MongoDB. The bar chart above reflects historical records across the 6-month window (${monthlyTrend[0]?.label || ''} – ${monthlyTrend[monthlyTrend.length - 1]?.label || ''}).`;
  } else if (summary.balance > 0) {
    statusStatement = `In ${monthName}, your total income exceeded your expenses by ${formatCurrency(summary.balance)} (Net Savings).`;
  } else if (summary.balance < 0) {
    statusStatement = `In ${monthName}, your total expenses exceeded your income by ${formatCurrency(Math.abs(summary.balance))} (Net Deficit).`;
  } else {
    statusStatement = `In ${monthName}, your total income equaled your total expenses (${formatCurrency(summary.totalIncome)}), breaking even.`;
  }

  return (
    <div className="analytics-container">
      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Chart 1: Expenses by Category */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-heading">Expenses by Category</h2>
              <span className="chart-subheading">
                Proportional breakdown of recorded expenses for {monthName}
              </span>
            </div>
            <div className="chart-icon-pill">
              <PieChartIcon size={16} />
            </div>
          </div>

          <div className="chart-content-area">
            {categoryExpenses.length === 0 ? (
              <div className="chart-empty-state">
                <div className="empty-icon-wrap">
                  <Tag size={24} />
                </div>
                <p className="empty-title">No expenses recorded</p>
                <p className="empty-subtitle">
                  There are no expense records for {monthName}. Log an expense to visualize category distribution.
                </p>
              </div>
            ) : (
              <div className="chart-responsive-box">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          stroke={isDark ? '#1e293b' : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CategoryPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      formatter={(value, entry) => {
                        const item = entry.payload;
                        return (
                          <span className="pie-legend-item">
                            {value} ({Number(item.percentage).toFixed(0)}%)
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: 6-Month Income vs Expenses */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-heading">Income vs Expenses (6-Month Trend)</h2>
              <span className="chart-subheading">
                Historical monthly cashflow from <strong>{monthlyTrend[0]?.label}</strong> to <strong>{monthlyTrend[monthlyTrend.length - 1]?.label}</strong>
              </span>
            </div>
            <div className="chart-icon-pill">
              <BarChart3 size={16} />
            </div>
          </div>

          <div className="chart-content-area">
            {!hasAnyTrendData ? (
              <div className="chart-empty-state">
                <div className="empty-icon-wrap">
                  <BarChart3 size={24} />
                </div>
                <p className="empty-title">No cashflow records found</p>
                <p className="empty-subtitle">
                  No income or expense transactions were recorded in MongoDB in the 6-month period ending in {monthName}.
                </p>
              </div>
            ) : (
              <div className="chart-responsive-box">
                {summary.transactionCount === 0 && (
                  <div className="trend-clarification-banner">
                    <span className="trend-clarification-icon">ℹ️</span>
                    <span className="trend-clarification-text">
                      <strong>{monthName}</strong> currently has ₹0 transactions. Bars plotted below represent historical records from prior months in this 6-month window ({monthlyTrend[0]?.label} – {monthlyTrend[monthlyTrend.length - 2]?.label || monthlyTrend[0]?.label}).
                    </span>
                  </div>
                )}
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={monthlyTrend}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDark ? '#334155' : '#e5e7eb'} 
                      vertical={false} 
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: isDark ? '#334155' : '#e5e7eb' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatCompactCurrency}
                      tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: isDark ? '#334155' : '#e5e7eb' }}
                      tickLine={false}
                      width={50}
                    />
                    <RechartsTooltip content={<TrendBarTooltip selectedMonth={selectedMonth} />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ paddingTop: '8px' }}
                    />
                    <Bar
                      dataKey="totalIncome"
                      name="Income"
                      fill={isDark ? '#38a169' : '#2d6a4f'}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="totalExpenses"
                      name="Expenses"
                      fill={isDark ? '#f87171' : '#b91c1c'}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 7: Textual Insights & Monthly Summary */}
      <section className="analytics-summary-card" aria-label="Monthly Insights Summary">
        <div className="summary-section-header">
          <div className="summary-title-group">
            <h3 className="summary-section-title">Monthly Summary — {monthName}</h3>
            <p className="summary-section-subtitle">
              Factual financial metrics calculated directly from your MongoDB records
            </p>
          </div>
          <div className="summary-tag">
            <TrendingUp size={14} />
            <span>Factual Data</span>
          </div>
        </div>

        {/* Core Metric Highlights */}
        <div className="insights-metrics-row">
          <div className="insight-metric-box">
            <div className="insight-metric-label">
              <ArrowUpRight size={14} className="icon-income" />
              <span>Total Income</span>
            </div>
            <span className="insight-metric-val val-income">
              {formatCurrency(summary.totalIncome)}
            </span>
          </div>

          <div className="insight-metric-box">
            <div className="insight-metric-label">
              <ArrowDownRight size={14} className="icon-expense" />
              <span>Total Expenses</span>
            </div>
            <span className="insight-metric-val val-expense">
              {formatCurrency(summary.totalExpenses)}
            </span>
          </div>

          <div className="insight-metric-box">
            <div className="insight-metric-label">
              <Scale size={14} className="icon-balance" />
              <span>Net Balance</span>
            </div>
            <span className="insight-metric-val val-balance">
              {formatCurrency(summary.balance)}
            </span>
          </div>

          <div className="insight-metric-box">
            <div className="insight-metric-label">
              <Tag size={14} className="icon-category" />
              <span>Top Expense Category</span>
            </div>
            <span className="insight-metric-val val-category">
              {topCategory ? topCategory.category : 'None'}
            </span>
            {topCategory && (
              <span className="top-category-sub">
                {formatCurrency(topCategory.amount)} ({topCategory.percentage.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>

        {/* Factual Statement Banner */}
        <div className="factual-statement-banner">
          <p className="statement-text">{statusStatement}</p>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
