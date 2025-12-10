/**
 * Employee Dashboard Component
 * Main dashboard for employees to check in/out and view attendance
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import attendanceApi from '../../api/attendanceApi';
import AttendanceTable from '../attendance/AttendanceTable';
import './Dashboard.css';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState({ isCheckedIn: false, currentRecord: null });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current status and attendance records
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statusRes, attendanceRes] = await Promise.all([
        attendanceApi.getStatus(),
        attendanceApi.getMyAttendance()
      ]);
      
      setStatus(statusRes);
      setRecords(attendanceRes.records);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Resolve with null location instead of rejecting
          resolve({ latitude: null, longitude: null });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      // Get location
      const location = await getCurrentLocation();
      
      // Perform check-in
      await attendanceApi.checkIn(location);
      
      setSuccess('Check-in successful!');
      await fetchData();
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      // Get location
      const location = await getCurrentLocation();
      
      // Perform check-out
      await attendanceApi.checkOut(location);
      
      setSuccess('Check-out successful!');
      await fetchData();
    } catch (err) {
      setError(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard">
      {/* Greeting Section */}
      <div className="dashboard-greeting">
        <h2>{getGreeting()}, {user?.name}! 👋</h2>
        <p>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}
      {success && (
        <div className="message success-message">
          {success}
        </div>
      )}

      {/* Status Card */}
      <div className="status-card">
        <div className="status-indicator">
          <span className={`status-dot ${status.isCheckedIn ? 'checked-in' : 'checked-out'}`}></span>
          <span className="status-text">
            {status.isCheckedIn ? 'Currently Checked In' : 'Not Checked In'}
          </span>
        </div>

        {status.isCheckedIn && status.currentRecord && (
          <div className="checkin-info">
            <p>Checked in at: <strong>
              {new Date(status.currentRecord.checkInTime).toLocaleTimeString()}
            </strong></p>
          </div>
        )}

        <div className="action-buttons">
          <button
            className="action-btn checkin-btn"
            onClick={handleCheckIn}
            disabled={status.isCheckedIn || actionLoading || loading}
          >
            {actionLoading ? '⏳ Processing...' : '📥 Check In'}
          </button>
          <button
            className="action-btn checkout-btn"
            onClick={handleCheckOut}
            disabled={!status.isCheckedIn || actionLoading || loading}
          >
            {actionLoading ? '⏳ Processing...' : '📤 Check Out'}
          </button>
        </div>

        <p className="location-note">
          📍 Your location will be recorded for verification
        </p>
      </div>

      {/* Attendance History */}
      <div className="dashboard-section">
        <h3>Recent Attendance</h3>
        <AttendanceTable 
          records={records}
          loading={loading}
          emptyMessage="No attendance records yet. Check in to get started!"
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
