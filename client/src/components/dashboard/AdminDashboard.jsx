/**
 * Admin Dashboard Component
 * Main dashboard for admin to manage employees and view attendance
 */
import { useState, useEffect, useCallback } from 'react';
import adminApi from '../../api/adminApi';
import AttendanceTable from '../attendance/AttendanceTable';
import './Dashboard.css';
import './AdminDashboard.css';

const AdminDashboard = ({ activeTab }) => {
  return (
    <div className="admin-dashboard">
      {activeTab === 'employees' && <EmployeeManagement />}
      {activeTab === 'attendance' && <AttendanceManagement />}
    </div>
  );
};

// Employee Management Section
const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getEmployees(showInactive);
      setEmployees(response.employees);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    
    try {
      setError('');
      await adminApi.deactivateEmployee(id);
      setSuccess(`${name} has been deactivated`);
      fetchEmployees();
    } catch (err) {
      setError(err.message || 'Failed to deactivate employee');
    }
  };

  const handleActivate = async (id, name) => {
    try {
      setError('');
      await adminApi.activateEmployee(id);
      setSuccess(`${name} has been activated`);
      fetchEmployees();
    } catch (err) {
      setError(err.message || 'Failed to activate employee');
    }
  };

  const handleAddEmployee = async (formData) => {
    try {
      setError('');
      await adminApi.createEmployee(formData);
      setSuccess('Employee added successfully');
      setShowAddForm(false);
      fetchEmployees();
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Employee Management</h2>
        <div className="section-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive
          </label>
          <button 
            className="primary-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Employee
          </button>
        </div>
      </div>

      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}

      {showAddForm && (
        <AddEmployeeForm 
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No employees found</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className={!emp.isActive ? 'inactive-row' : ''}>
                    <td>{emp.employeeId || '-'}</td>
                    <td>{emp.name}</td>
                    <td>{emp.mobileNumber}</td>
                    <td>
                      <span className={`role-badge ${emp.role}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${emp.isActive ? 'active' : 'inactive'}`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {emp.isActive ? (
                        <button
                          className="action-btn-small danger"
                          onClick={() => handleDeactivate(emp.id, emp.name)}
                          disabled={emp.role === 'admin'}
                          title={emp.role === 'admin' ? 'Cannot deactivate admin' : 'Deactivate'}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="action-btn-small success"
                          onClick={() => handleActivate(emp.id, emp.name)}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Add Employee Form
const AddEmployeeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    employeeId: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobileNumber) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!formData.employeeId) {
      setError('Employee ID is required for employee login');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-form-container">
      <form onSubmit={handleSubmit} className="add-form">
        <h3>Add New Employee</h3>
        
        {error && <div className="form-error">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile number"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Employee ID *</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="Required for login"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Attendance Management Section
const AttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    from: '',
    to: ''
  });
  const [error, setError] = useState('');

  // Fetch employees for filter dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await adminApi.getEmployees(true);
        setEmployees(response.employees);
      } catch (err) {
        console.error('Failed to load employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch attendance records
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (filters.userId) params.userId = filters.userId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      
      const response = await adminApi.getAttendance(params);
      setRecords(response.records);
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {};
      if (filters.userId) params.userId = filters.userId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      
      const blob = await adminApi.exportExcel(params);
      adminApi.downloadFile(blob, `attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      setError(err.message || 'Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      const params = {};
      if (filters.userId) params.userId = filters.userId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      
      const blob = await adminApi.exportPdf(params);
      adminApi.downloadFile(blob, `attendance_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      setError(err.message || 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Attendance Records</h2>
      </div>

      {error && <div className="message error-message">{error}</div>}

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Employee</label>
          <select
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.employeeId ? `(${emp.employeeId})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>From Date</label>
          <input
            type="date"
            name="from"
            value={filters.from}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>
          <input
            type="date"
            name="to"
            value={filters.to}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-actions">
          <button 
            className="export-btn excel"
            onClick={handleExportExcel}
            disabled={exporting || records.length === 0}
          >
            {exporting ? '⏳' : '📊'} Export Excel
          </button>
          <button 
            className="export-btn pdf"
            onClick={handleExportPdf}
            disabled={exporting || records.length === 0}
          >
            {exporting ? '⏳' : '📄'} Export PDF
          </button>
        </div>
      </div>

      {/* Records count */}
      {!loading && (
        <p className="records-count">
          Showing {records.length} record{records.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Attendance Table */}
      <AttendanceTable 
        records={records}
        showUserInfo={true}
        loading={loading}
        emptyMessage="No attendance records found for the selected filters"
      />
    </div>
  );
};

export default AdminDashboard;
