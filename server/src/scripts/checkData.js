/**
 * Database Check Script
 * Check what data is stored in the attendance_records table
 */
require('dotenv').config();

const db = require('../config/db');

const checkData = async () => {
  try {
    console.log('\n📊 Checking attendance records...\n');
    
    // Get all attendance records with location data
    const result = await db.query(`
      SELECT 
        ar.id,
        ar.user_id,
        u.name as user_name,
        ar.check_in_time,
        ar.check_in_latitude,
        ar.check_in_longitude,
        ar.check_out_time,
        ar.check_out_latitude,
        ar.check_out_longitude
      FROM attendance_records ar
      JOIN users u ON ar.user_id = u.id
      ORDER BY ar.check_in_time DESC
      LIMIT 10
    `);
    
    console.log(`Found ${result.rows.length} records:\n`);
    
    result.rows.forEach((record, i) => {
      console.log(`Record #${i + 1}:`);
      console.log(`  User: ${record.user_name} (ID: ${record.user_id})`);
      console.log(`  Check-in: ${record.check_in_time}`);
      console.log(`  Check-in Location: lat=${record.check_in_latitude}, lng=${record.check_in_longitude}`);
      console.log(`  Check-out: ${record.check_out_time || 'Not checked out'}`);
      console.log(`  Check-out Location: lat=${record.check_out_latitude}, lng=${record.check_out_longitude}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking data:', error);
    process.exit(1);
  }
};

checkData();
