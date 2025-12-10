/**
 * PDF Export Utility
 * Generates PDF files for attendance data using PDFKit
 */
const PDFDocument = require('pdfkit');

/**
 * Generate a PDF document with attendance data
 * @param {Array} records - Attendance records with user info
 * @param {Object} filters - Applied filters for the report header
 * @returns {Promise<Buffer>} PDF file buffer
 */
const generateAttendancePdf = async (records, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
        layout: 'landscape' // Better for tables
      });
      
      const chunks = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Title
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('Employee Attendance Report', { align: 'center' });
      
      doc.moveDown(0.5);
      
      // Filter info
      let filterText = 'Generated: ' + new Date().toLocaleString();
      if (filters.from || filters.to) {
        filterText += ` | Date Range: ${filters.from || 'Start'} to ${filters.to || 'Now'}`;
      }
      if (filters.employeeName) {
        filterText += ` | Employee: ${filters.employeeName}`;
      }
      
      doc.fontSize(10)
         .font('Helvetica-Oblique')
         .text(filterText, { align: 'center' });
      
      doc.moveDown(1);
      
      // Table header
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidths = [40, 80, 100, 80, 90, 100, 90, 100];
      const headers = ['S.No', 'Emp ID', 'Name', 'Date', 'Check-In', 'Check-In Loc', 'Check-Out', 'Check-Out Loc'];
      
      // Draw header background
      doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), 20)
         .fill('#4472C4');
      
      // Draw header text
      doc.fillColor('white')
         .fontSize(9)
         .font('Helvetica-Bold');
      
      let xPos = tableLeft;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 5, tableTop + 5, { width: colWidths[i] - 10, align: 'left' });
        xPos += colWidths[i];
      });
      
      // Reset for data
      doc.fillColor('black')
         .font('Helvetica')
         .fontSize(8);
      
      let yPos = tableTop + 25;
      const rowHeight = 30;
      
      // Draw data rows
      records.forEach((record, index) => {
        // Check if we need a new page
        if (yPos > doc.page.height - 80) {
          doc.addPage();
          yPos = 50;
        }
        
        // Alternate row background
        if (index % 2 === 1) {
          doc.rect(tableLeft, yPos, colWidths.reduce((a, b) => a + b, 0), rowHeight)
             .fill('#F2F2F2');
          doc.fillColor('black');
        }
        
        const checkInLoc = record.check_in_latitude && record.check_in_longitude
          ? `${record.check_in_latitude.toFixed(4)}, ${record.check_in_longitude.toFixed(4)}`
          : 'N/A';
        
        const checkOutLoc = record.check_out_latitude && record.check_out_longitude
          ? `${record.check_out_latitude.toFixed(4)}, ${record.check_out_longitude.toFixed(4)}`
          : 'N/A';
        
        const rowData = [
          String(index + 1),
          record.employee_id || 'N/A',
          record.user_name || 'Unknown',
          new Date(record.check_in_time).toLocaleDateString(),
          new Date(record.check_in_time).toLocaleTimeString(),
          checkInLoc,
          record.check_out_time 
            ? new Date(record.check_out_time).toLocaleTimeString() 
            : 'Not out',
          checkOutLoc
        ];
        
        xPos = tableLeft;
        rowData.forEach((data, i) => {
          doc.text(data, xPos + 5, yPos + 5, { 
            width: colWidths[i] - 10, 
            height: rowHeight - 10,
            ellipsis: true
          });
          xPos += colWidths[i];
        });
        
        // Draw row border
        doc.rect(tableLeft, yPos, colWidths.reduce((a, b) => a + b, 0), rowHeight)
           .stroke('#CCCCCC');
        
        yPos += rowHeight;
      });
      
      // Summary
      doc.moveDown(2);
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(`Total Records: ${records.length}`, tableLeft);
      
      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .font('Helvetica')
           .text(
             `Page ${i + 1} of ${pageCount} | Employee Attendance System`,
             50,
             doc.page.height - 30,
             { align: 'center', width: doc.page.width - 100 }
           );
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateAttendancePdf
};
