/**
 * Authentication Context
 * Provides user authentication state and methods throughout the app
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

// Create context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid by fetching profile
          setToken(storedToken);
          const response = await authApi.getProfile();
          setUser(response.user);
        } catch (error) {
          // Token invalid, clear storage
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user
   * @param {string} identifier - Mobile number or employee ID
   * @param {string} password - User password
   * @returns {Promise} Login result
   */
  const login = useCallback(async (identifier, password) => {
    try {
      const response = await authApi.login({ identifier, password });
      
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);

      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  }, [navigate]);

  /**
   * Register new user
   * @param {Object} data - Registration data
   * @returns {Promise} Signup result
   */
  const signup = useCallback(async (data) => {
    try {
      const response = await authApi.signup(data);
      
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);

      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Signup failed' 
      };
    }
  }, [navigate]);

  /**
   * Login employee with ID only (no password)
   * @param {string} employeeId - Employee ID
   * @returns {Promise} Login result
   */
  const loginEmployee = useCallback(async (employeeId) => {
    try {
      const response = await authApi.loginEmployee({ employeeId });
      
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);

      // Redirect to employee dashboard
      navigate('/employee');

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  }, [navigate]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token && !!user;

  /**
   * Check if user is admin
   */
  const isAdmin = user?.role === 'admin';

  /**
   * Check if user is employee
   */
  const isEmployee = user?.role === 'employee';

  // Context value
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isEmployee,
    login,
    loginEmployee,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
