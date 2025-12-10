/**
 * Attendance Controller
 * Handles employee check-in/check-out and attendance history
 */
const attendanceModel = require('../models/attendanceModel');
const { asyncHandler, ApiError } = require('../middleware/errorMiddleware');

/**
 * Check-in employee
 * POST /api/attendance/check-in
 */
const checkIn = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { latitude, longitude } = req.body;
  
  // Check for existing open record (already checked in but not checked out)
  const openRecord = await attendanceModel.findOpenRecord(userId);
  
  if (openRecord) {
    throw new ApiError(400, 'You are already checked in. Please check out first.');
  }
  
  // Create check-in record
  const record = await attendanceModel.checkIn({
    userId,
    latitude: latitude || null,
    longitude: longitude || null
  });
  
  res.status(201).json({
    success: true,
    message: 'Check-in successful',
    record: {
      id: record.id,
      checkInTime: record.check_in_time,
      checkInLatitude: record.check_in_latitude,
      checkInLongitude: record.check_in_longitude
    }
  });
});

/**
 * Check-out employee
 * POST /api/attendance/check-out
 */
const checkOut = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { latitude, longitude } = req.body;
  
  // Find open record
  const openRecord = await attendanceModel.findOpenRecord(userId);
  
  if (!openRecord) {
    throw new ApiError(400, 'No active check-in found. Please check in first.');
  }
  
  // Update with check-out
  const record = await attendanceModel.checkOut(openRecord.id, {
    latitude: latitude || null,
    longitude: longitude || null
  });
  
  res.json({
    success: true,
    message: 'Check-out successful',
    record: {
      id: record.id,
      checkInTime: record.check_in_time,
      checkInLatitude: record.check_in_latitude,
      checkInLongitude: record.check_in_longitude,
      checkOutTime: record.check_out_time,
      checkOutLatitude: record.check_out_latitude,
      checkOutLongitude: record.check_out_longitude
    }
  });
});

/**
 * Get current check-in status
 * GET /api/attendance/status
 */
const getStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const openRecord = await attendanceModel.findOpenRecord(userId);
  
  res.json({
    success: true,
    isCheckedIn: !!openRecord,
    currentRecord: openRecord ? {
      id: openRecord.id,
      checkInTime: openRecord.check_in_time,
      checkInLatitude: openRecord.check_in_latitude,
      checkInLongitude: openRecord.check_in_longitude
    } : null
  });
});

/**
 * Get employee's own attendance records
 * GET /api/attendance/me
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { from, to } = req.query;
  
  // Parse dates if provided
  const filters = {};
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
  
  const records = await attendanceModel.findByUserId(userId, filters);
  
  // Get summary
  const summary = await attendanceModel.getSummary(userId, filters);
  
  res.json({
    success: true,
    records: records.map(record => ({
      id: record.id,
      checkInTime: record.check_in_time,
      checkInLatitude: record.check_in_latitude,
      checkInLongitude: record.check_in_longitude,
      checkOutTime: record.check_out_time,
      checkOutLatitude: record.check_out_latitude,
      checkOutLongitude: record.check_out_longitude,
      createdAt: record.created_at
    })),
    summary: {
      totalRecords: parseInt(summary.total_records),
      completedRecords: parseInt(summary.completed_records),
      firstCheckIn: summary.first_check_in,
      lastCheckIn: summary.last_check_in
    }
  });
});

module.exports = {
  checkIn,
  checkOut,
  getStatus,
  getMyAttendance
};
