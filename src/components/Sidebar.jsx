import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Settings,
  WalletCards,
  X
} from 'lucide-react';
import './Sidebar.css';

/**
 * Sidebar Navigation Component
 * 
 * Provides navigation links: Dashboard, Transactions, Analytics, Settings.
 * Supports active route state and collapsible mobile behavior.
 */
function Sidebar({ activeTab = 'Dashboard', onSelectTab, isOpen, onClose }) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Transactions', icon: ReceiptText },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <WalletCards size={20} strokeWidth={2.2} className="brand-icon" />
          </div>
          <div className="brand-info">
            <span className="brand-name">MoneyWise</span>
            <span className="brand-tagline">Expense Tracker</span>
          </div>
          {/* Close button visible only on small screens */}
          <button 
            type="button"
            className="sidebar-close-btn" 
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          <span className="nav-group-label">Menu</span>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <li key={item.name} className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (onSelectTab) onSelectTab(item.name);
                      if (onClose) onClose();
                    }}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer info showing module version */}
        <div className="sidebar-footer">
          <div className="version-card">
            <span className="version-label">MoneyWise v1.0</span>
            <span className="version-sub">Fullstack MERN Tracker</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
