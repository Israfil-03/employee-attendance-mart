/**
 * Attendance Table Component
 * Displays attendance records in a table format
 */
import { useState } from 'react';
import LocationMap from './LocationMap';
import './AttendanceTable.css';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

const formatTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const AttendanceTable = ({ 
  records, 
  showUserInfo = false,
  loading = false,
  emptyMessage = 'No attendance records found'
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapType, setMapType] = useState(null); // 'checkin' or 'checkout'

  const handleViewLocation = (record, type) => {
    if (type === 'checkin') {
      setSelectedLocation({
        lat: record.checkInLatitude,
        lng: record.checkInLongitude,
        label: `Check-in: ${record.userName || 'Employee'}`
      });
    } else {
      setSelectedLocation({
        lat: record.checkOutLatitude,
        lng: record.checkOutLongitude,
        label: `Check-out: ${record.userName || 'Employee'}`
      });
    }
    setMapType(type);
  };

  const closeMap = () => {
    setSelectedLocation(null);
    setMapType(null);
  };

  if (loading) {
    return (
      <div className="attendance-loading">
        <div className="spinner"></div>
        <p>Loading attendance records...</p>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="attendance-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="attendance-table-container">
      {selectedLocation && (
        <div className="map-modal">
          <div className="map-modal-content">
            <div className="map-modal-header">
              <h3>{selectedLocation.label}</h3>
              <button onClick={closeMap} className="close-btn">&times;</button>
            </div>
            <LocationMap 
              lat={selectedLocation.lat}
              lng={selectedLocation.lng}
              label={selectedLocation.label}
              height="400px"
            />
          </div>
          <div className="map-modal-backdrop" onClick={closeMap}></div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              {showUserInfo && <th>Employee</th>}
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td data-label="Date">
                  {formatDate(record.checkInTime)}
                </td>
                {showUserInfo && (
                  <td data-label="Employee">
                    <div className="employee-info">
                      <span className="employee-name">{record.userName}</span>
                      {record.employeeId && (
                        <span className="employee-id">{record.employeeId}</span>
                      )}
                    </div>
                  </td>
                )}
                <td data-label="Check-in">
                  <span className="time-badge checkin">
                    {formatTime(record.checkInTime)}
                  </span>
                </td>
                <td data-label="Check-out">
                  {record.checkOutTime ? (
                    <span className="time-badge checkout">
                      {formatTime(record.checkOutTime)}
                    </span>
                  ) : (
                    <span className="time-badge pending">Pending</span>
                  )}
                </td>
                <td data-label="Location">
                  <div className="location-buttons">
                    {record.checkInLatitude != null && record.checkInLongitude != null && (
                      <button 
                        className="location-btn"
                        onClick={() => handleViewLocation(record, 'checkin')}
                        title="View check-in location"
                      >
                        📍 In
                      </button>
                    )}
                    {record.checkOutLatitude != null && record.checkOutLongitude != null && (
                      <button 
                        className="location-btn"
                        onClick={() => handleViewLocation(record, 'checkout')}
                        title="View check-out location"
                      >
                        📍 Out
                      </button>
                    )}
                    {record.checkInLatitude == null && record.checkOutLatitude == null && (
                      <span className="no-location">N/A</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
