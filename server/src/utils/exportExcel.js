/**
 * Excel Export Utility
 * Generates Excel files for attendance data using ExcelJS
 */
const ExcelJS = require('exceljs');

/**
 * Format a date for display
 * @param {Date|string} date 
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
};

/**
 * Generate an Excel workbook with attendance data
 * @param {Array} records - Attendance records with user info
 * @param {Object} filters - Applied filters for the report header
 * @returns {Promise<Buffer>} Excel file buffer
 */
const generateAttendanceExcel = async (records, filters = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Employee Attendance System';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('Attendance Report');
  
  // Add title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'Employee Attendance Report';
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };
  
  // Add filter info
  let filterText = 'Generated: ' + new Date().toLocaleString();
  if (filters.from || filters.to) {
    filterText += ` | Date Range: ${filters.from || 'Start'} to ${filters.to || 'Now'}`;
  }
  if (filters.employeeName) {
    filterText += ` | Employee: ${filters.employeeName}`;
  }
  
  worksheet.mergeCells('A2:H2');
  const filterCell = worksheet.getCell('A2');
  filterCell.value = filterText;
  filterCell.font = { size: 10, italic: true };
  filterCell.alignment = { horizontal: 'center' };
  
  // Add empty row
  worksheet.addRow([]);
  
  // Define columns
  worksheet.columns = [
    { key: 'sno', header: 'S.No', width: 8 },
    { key: 'employeeId', header: 'Employee ID', width: 15 },
    { key: 'name', header: 'Name', width: 20 },
    { key: 'date', header: 'Date', width: 15 },
    { key: 'checkIn', header: 'Check-In Time', width: 20 },
    { key: 'checkInLocation', header: 'Check-In Location', width: 25 },
    { key: 'checkOut', header: 'Check-Out Time', width: 20 },
    { key: 'checkOutLocation', header: 'Check-Out Location', width: 25 }
  ];
  
  // Add header row
  const headerRow = worksheet.addRow([
    'S.No',
    'Employee ID',
    'Name',
    'Date',
    'Check-In Time',
    'Check-In Location',
    'Check-Out Time',
    'Check-Out Location'
  ]);
  
  // Style header row
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };
    cell.alignment = { horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  // Add data rows
  records.forEach((record, index) => {
    const checkInLocation = record.check_in_latitude && record.check_in_longitude
      ? `${record.check_in_latitude.toFixed(6)}, ${record.check_in_longitude.toFixed(6)}`
      : 'N/A';
    
    const checkOutLocation = record.check_out_latitude && record.check_out_longitude
      ? `${record.check_out_latitude.toFixed(6)}, ${record.check_out_longitude.toFixed(6)}`
      : 'N/A';
    
    const row = worksheet.addRow({
      sno: index + 1,
      employeeId: record.employee_id || 'N/A',
      name: record.user_name,
      date: new Date(record.check_in_time).toLocaleDateString(),
      checkIn: new Date(record.check_in_time).toLocaleTimeString(),
      checkInLocation: checkInLocation,
      checkOut: record.check_out_time 
        ? new Date(record.check_out_time).toLocaleTimeString() 
        : 'Not checked out',
      checkOutLocation: checkOutLocation
    });
    
    // Add borders to data cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Alternate row colors
    if (index % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F2F2F2' }
        };
      });
    }
  });
  
  // Add summary at the bottom
  worksheet.addRow([]);
  const summaryRow = worksheet.addRow(['Total Records:', records.length]);
  summaryRow.getCell(1).font = { bold: true };
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  generateAttendanceExcel
};
