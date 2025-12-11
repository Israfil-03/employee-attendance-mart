/**
 * Employee Layout Component
 * Provides consistent layout for employee pages
 */
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Layout.css';

const EmployeeLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-left">
          <div className="header-logo">
            <h1 className="header-title">Rose Mart</h1>
          </div>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">Employee</span>
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
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <p>&copy; {new Date().getFullYear()} Rose Mart Attendance System</p>
      </footer>
    </div>
  );
};

export default EmployeeLayout;
