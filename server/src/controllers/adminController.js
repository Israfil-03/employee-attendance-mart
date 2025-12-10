/**
 * Admin Controller
 * Handles employee management and attendance administration
 */
const userModel = require('../models/userModel');
const attendanceModel = require('../models/attendanceModel');
const { hashPassword } = require('../utils/password');
const { generateAttendanceExcel } = require('../utils/exportExcel');
const { generateAttendancePdf } = require('../utils/exportPdf');
const { asyncHandler, ApiError } = require('../middleware/errorMiddleware');

// ============= Employee Management =============

/**
 * Get all employees
 * GET /api/admin/employees
 */
const getEmployees = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  
  const employees = await userModel.findAll(includeInactive === 'true');
  
  res.json({
    success: true,
    employees: employees.map(emp => ({
      id: emp.id,
      employeeId: emp.employee_id,
      name: emp.name,
      mobileNumber: emp.mobile_number,
      role: emp.role,
      isActive: emp.is_active,
      createdAt: emp.created_at
    }))
  });
});

/**
 * Create a new employee
 * POST /api/admin/employees
 */
const createEmployee = asyncHandler(async (req, res) => {
  const { name, mobileNumber, employeeId, password, role } = req.body;
  
  // Validate required fields
  if (!name || !mobileNumber || !password) {
    throw new ApiError(400, 'Name, mobile number, and password are required');
  }
  
  // Validate mobile number format
  if (!/^\d{10,15}$/.test(mobileNumber.replace(/[^\d]/g, ''))) {
    throw new ApiError(400, 'Invalid mobile number format');
  }
  
  // Validate password length
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  
  // Check if mobile number already exists
  const existingUser = await userModel.findByMobileNumber(mobileNumber);
  if (existingUser) {
    throw new ApiError(400, 'Mobile number already registered');
  }
  
  // Check if employee ID already exists (if provided)
  if (employeeId) {
    const existingEmployee = await userModel.findByEmployeeId(employeeId);
    if (existingEmployee) {
      throw new ApiError(400, 'Employee ID already exists');
    }
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user
  const user = await userModel.create({
    name,
    mobileNumber,
    employeeId: employeeId || null,
    passwordHash,
    role: role || 'employee'
  });
  
  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    employee: {
      id: user.id,
      employeeId: user.employee_id,
      name: user.name,
      mobileNumber: user.mobile_number,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at
    }
  });
});

/**
 * Deactivate an employee (soft delete)
 * DELETE /api/admin/employees/:id
 */
const deactivateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Prevent self-deactivation
  if (parseInt(id) === req.user.id) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }
  
  const employee = await userModel.findById(id);
  
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  
  // Soft delete by setting is_active to false
  const updatedEmployee = await userModel.updateActiveStatus(id, false);
  
  res.json({
    success: true,
    message: 'Employee deactivated successfully',
    employee: {
      id: updatedEmployee.id,
      name: updatedEmployee.name,
      isActive: updatedEmployee.is_active
    }
  });
});

/**
 * Reactivate an employee
 * PATCH /api/admin/employees/:id/activate
 */
const activateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const employee = await userModel.findById(id);
  
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  
  const updatedEmployee = await userModel.updateActiveStatus(id, true);
  
  res.json({
    success: true,
    message: 'Employee activated successfully',
    employee: {
      id: updatedEmployee.id,
      name: updatedEmployee.name,
      isActive: updatedEmployee.is_active
    }
  });
});

// ============= Attendance Management =============

/**
 * Get all attendance records (with filters)
 * GET /api/admin/attendance
 */
const getAttendance = asyncHandler(async (req, res) => {
  const { userId, from, to } = req.query;
  
  // Parse filters
  const filters = {};
  
  if (userId) {
    filters.userId = parseInt(userId);
    if (isNaN(filters.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }
  }
  
  if (from) {
    filters.from = new Date(from);
    if (isNaN(filters.from.getTime())) {
      throw new ApiError(400, 'Invalid "from" date format');
    }
  }
  
  if (to) {
    filters.to = new Date(to);
    if (isNaN(filters.to.getTime())) {
      throw new ApiError(400, 'Invalid "to" date format');
    }
    // Set to end of day
    filters.to.setHours(23, 59, 59, 999);
  }
  
  const records = await attendanceModel.findAllWithUser(filters);
  
  res.json({
    success: true,
    records: records.map(record => ({
      id: record.id,
      userId: record.user_id,
      userName: record.user_name,
      employeeId: record.employee_id,
      mobileNumber: record.mobile_number,
      checkInTime: record.check_in_time,
      checkInLatitude: record.check_in_latitude,
      checkInLongitude: record.check_in_longitude,
      checkOutTime: record.check_out_time,
      checkOutLatitude: record.check_out_latitude,
      checkOutLongitude: record.check_out_longitude,
      createdAt: record.created_at
    })),
    count: records.length
  });
});

/**
 * Export attendance to Excel
 * GET /api/admin/attendance/export/excel
 */
const exportExcel = asyncHandler(async (req, res) => {
  const { userId, from, to } = req.query;
  
  // Parse filters
  const filters = {};
  
  if (userId) {
    filters.userId = parseInt(userId);
  }
  if (from) {
    filters.from = new Date(from);
  }
  if (to) {
    filters.to = new Date(to);
    filters.to.setHours(23, 59, 59, 999);
  }
  
  // Get records
  const records = await attendanceModel.findAllWithUser(filters);
  
  // If filtering by user, get their name for the report
  let employeeName = null;
  if (filters.userId) {
    const user = await userModel.findById(filters.userId);
    employeeName = user?.name;
  }
  
  // Generate Excel
  const buffer = await generateAttendanceExcel(records, {
    from: from || null,
    to: to || null,
    employeeName
  });
  
  // Set response headers for file download
  const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', buffer.length);
  
  res.send(buffer);
});

/**
 * Export attendance to PDF
 * GET /api/admin/attendance/export/pdf
 */
const exportPdf = asyncHandler(async (req, res) => {
  const { userId, from, to } = req.query;
  
  // Parse filters
  const filters = {};
  
  if (userId) {
    filters.userId = parseInt(userId);
  }
  if (from) {
    filters.from = new Date(from);
  }
  if (to) {
    filters.to = new Date(to);
    filters.to.setHours(23, 59, 59, 999);
  }
  
  // Get records
  const records = await attendanceModel.findAllWithUser(filters);
  
  // If filtering by user, get their name for the report
  let employeeName = null;
  if (filters.userId) {
    const user = await userModel.findById(filters.userId);
    employeeName = user?.name;
  }
  
  // Generate PDF
  const buffer = await generateAttendancePdf(records, {
    from: from || null,
    to: to || null,
    employeeName
  });
  
  // Set response headers for file download
  const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.pdf`;
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', buffer.length);
  
  res.send(buffer);
});

module.exports = {
  getEmployees,
  createEmployee,
  deactivateEmployee,
  activateEmployee,
  getAttendance,
  exportExcel,
  exportPdf
};
