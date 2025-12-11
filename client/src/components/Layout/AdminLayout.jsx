/**
 * Admin Layout Component
 * Provides consistent layout for admin pages with navigation
 */
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Layout.css';

const AdminLayout = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'employees', label: '👥 Employees', icon: '👥' },
    { id: 'attendance', label: '📋 Attendance', icon: '📋' }
  ];

  return (
    <div className="layout admin-layout">
      <header className="layout-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <div className="header-logo">
            <span className="logo-icon">⚙️</span>
            <h1 className="header-title">Admin Panel</h1>
          </div>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <span className="user-role admin-badge">Admin</span>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <span className="theme-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className={`layout-nav ${menuOpen ? 'open' : ''}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              onTabChange(tab.id);
              setMenuOpen(false);
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="layout-main">
        {children}
      </main>

      <footer className="layout-footer">
        <p>&copy; {new Date().getFullYear()} Attendance System - Admin Panel</p>
      </footer>
    </div>
  );
};

export default AdminLayout;
