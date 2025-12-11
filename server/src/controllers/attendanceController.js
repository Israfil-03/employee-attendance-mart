/**
 * Attendance Controller
 * Handles employee check-in/check-out and attendance history
 */
const attendanceModel = require('../models/attendanceModel');
const { asyncHandler, ApiError } = require('../middleware/errorMiddleware');
const { NODE_ENV } = require('../config/env');

// Helper for debug logging
const debugLog = (...args) => {
  if (NODE_ENV === 'development') {
    console.log(...args);
  }
};

/**
 * Check-in employee
 * POST /api/attendance/check-in
 */
const checkIn = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { latitude, longitude } = req.body;
  
  // Debug logging for location data
  debugLog('📍 Check-in request body:', JSON.stringify(req.body));
  debugLog('📍 Parsed location - lat:', latitude, 'lng:', longitude);
  debugLog('📍 Location types - lat:', typeof latitude, 'lng:', typeof longitude);
  
  // Validate location is provided
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    throw new ApiError(400, 'Location is required for check-in. Please enable location access and try again.');
  }
  
  // Validate location values are valid numbers
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    throw new ApiError(400, 'Invalid location data. Please try again.');
  }
  
  // Check if user has already completed attendance today
  const completedToday = await attendanceModel.hasCompletedToday(userId);
  if (completedToday) {
    throw new ApiError(400, 'You have already completed your attendance for today. You can only check in once per day.');
  }
  
  // Check for existing open record (already checked in but not checked out)
  const openRecord = await attendanceModel.findOpenRecord(userId);
  
  if (openRecord) {
    throw new ApiError(400, 'You are already checked in. Please check out first.');
  }
  
  // Create check-in record
  const record = await attendanceModel.checkIn({
    userId,
    latitude,
    longitude
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
  
  // Debug logging for location data
  debugLog('📍 Check-out request body:', JSON.stringify(req.body));
  debugLog('📍 Parsed location - lat:', latitude, 'lng:', longitude);
  debugLog('📍 Location types - lat:', typeof latitude, 'lng:', typeof longitude);
  
  // Validate location is provided
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    throw new ApiError(400, 'Location is required for check-out. Please enable location access and try again.');
  }
  
  // Validate location values are valid numbers
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    throw new ApiError(400, 'Invalid location data. Please try again.');
  }
  
  // Find open record
  const openRecord = await attendanceModel.findOpenRecord(userId);
  
  if (!openRecord) {
    throw new ApiError(400, 'No active check-in found. Please check in first.');
  }
  
  // Update with check-out
  const record = await attendanceModel.checkOut(openRecord.id, {
    latitude,
    longitude
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
  const completedToday = await attendanceModel.hasCompletedToday(userId);
  
  res.json({
    success: true,
    isCheckedIn: !!openRecord,
    hasCompletedToday: completedToday,
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
