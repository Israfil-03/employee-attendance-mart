/**
 * Login Form Component
 * Handles user login with mobile number or employee ID
 */
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './AuthForms.css';

const LoginForm = () => {
  const { login, loginEmployee } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loginType, setLoginType] = useState('employee'); // 'employee' or 'admin'
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate based on login type
    if (loginType === 'employee') {
      if (!formData.identifier) {
        setError('Please enter your Employee ID');
        setLoading(false);
        return;
      }
      const result = await loginEmployee(formData.identifier);
      if (!result.success) {
        setError(result.message);
      }
    } else {
      if (!formData.identifier || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const result = await login(formData.identifier, formData.password);
      if (!result.success) {
        setError(result.message);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <button 
        onClick={toggleTheme} 
        className="auth-theme-toggle"
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">👤</div>
          <h1>Attendance System</h1>
          <p>Sign in to mark your attendance</p>
        </div>

        {/* Login Type Toggle */}
        <div className="login-type-toggle">
          <button
            type="button"
            className={`toggle-btn ${loginType === 'employee' ? 'active' : ''}`}
            onClick={() => setLoginType('employee')}
          >
            👷 Employee
          </button>
          <button
            type="button"
            className={`toggle-btn ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => setLoginType('admin')}
          >
            🔐 Admin
          </button>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier">
              {loginType === 'employee' ? 'Employee ID' : 'Mobile Number or Employee ID'}
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder={loginType === 'employee' ? 'Enter your Employee ID' : 'Enter mobile number or employee ID'}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {loginType === 'admin' && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button btn-3d"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Employee Attendance Management System</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
