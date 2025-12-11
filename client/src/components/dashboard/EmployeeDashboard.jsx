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
  const [status, setStatus] = useState({ isCheckedIn: false, hasCompletedToday: false, currentRecord: null });
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
        console.error('📍 Geolocation not supported by browser');
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      console.log('📍 Requesting geolocation...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log('📍 Geolocation success:', coords);
          resolve(coords);
        },
        (error) => {
          console.error('📍 Geolocation error code:', error.code);
          console.error('📍 Geolocation error message:', error.message);
          
          // Provide more specific error messages
          let errorMessage = 'Location access failed';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          // Resolve with null location but log the error
          console.warn('📍 Proceeding without location:', errorMessage);
          resolve({ latitude: null, longitude: null, locationError: errorMessage });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
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
      
      // Debug logging
      console.log('📍 Check-in location obtained:', location);
      console.log('📍 Location types - lat:', typeof location.latitude, 'lng:', typeof location.longitude);
      
      // Prepare the data to send (only send latitude and longitude)
      const checkInData = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      
      console.log('📍 Sending check-in data:', JSON.stringify(checkInData));
      
      // Perform check-in
      const response = await attendanceApi.checkIn(checkInData);
      console.log('📍 Check-in response:', response);
      
      // Show appropriate message based on location status
      if (location.locationError) {
        setSuccess(`Check-in successful! (Note: ${location.locationError})`);
      } else {
        setSuccess('Check-in successful!');
      }
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
      
      // Debug logging
      console.log('📍 Check-out location obtained:', location);
      console.log('📍 Location types - lat:', typeof location.latitude, 'lng:', typeof location.longitude);
      
      // Prepare the data to send (only send latitude and longitude)
      const checkOutData = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      
      console.log('📍 Sending check-out data:', JSON.stringify(checkOutData));
      
      // Perform check-out
      const response = await attendanceApi.checkOut(checkOutData);
      console.log('📍 Check-out response:', response);
      
      // Show appropriate message based on location status
      if (location.locationError) {
        setSuccess(`Check-out successful! (Note: ${location.locationError})`);
      } else {
        setSuccess('Check-out successful!');
      }
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

  // Format date as dd/mm/yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time as 12-hour with AM/PM
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get current day name
  const getDayName = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="dashboard">
      {/* Greeting Section */}
      <div className="dashboard-greeting">
        <h2>{getGreeting()}, {user?.name}! 👋</h2>
        <p>{getDayName()}, {formatDate(new Date())}</p>
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
          <span className={`status-dot ${status.hasCompletedToday ? 'completed' : status.isCheckedIn ? 'checked-in' : 'checked-out'}`}></span>
          <span className="status-text">
            {status.hasCompletedToday 
              ? 'Attendance Completed for Today ✓' 
              : status.isCheckedIn 
                ? 'Currently Checked In' 
                : 'Not Checked In'}
          </span>
        </div>

        {status.isCheckedIn && status.currentRecord && (
          <div className="checkin-info">
            <p>Checked in at: <strong>
              {formatTime(status.currentRecord.checkInTime)}
            </strong></p>
          </div>
        )}

        {status.hasCompletedToday && (
          <div className="completed-info">
            <p>🎉 Great job! You have completed your attendance for today.</p>
          </div>
        )}

        <div className="action-buttons">
          <button
            className="action-btn checkin-btn"
            onClick={handleCheckIn}
            disabled={status.isCheckedIn || status.hasCompletedToday || actionLoading || loading}
          >
            {actionLoading ? '⏳ Processing...' : '📥 Check In'}
          </button>
          <button
            className="action-btn checkout-btn"
            onClick={handleCheckOut}
            disabled={!status.isCheckedIn || status.hasCompletedToday || actionLoading || loading}
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
