/**
 * Employee Layout Component
 * Provides consistent layout for employee pages
 */
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const EmployeeLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-left">
          <h1 className="header-title">Attendance System</h1>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">Employee</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <p>&copy; {new Date().getFullYear()} Employee Attendance System</p>
      </footer>
    </div>
  );
};

export default EmployeeLayout;
