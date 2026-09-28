const { jsPDF } = require('jspdf');

const generateInvoice = async (booking, user) => {
    try {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 55, 140);
        doc.text('SMART VEHICLE SERVICE', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Service Invoice', 105, 35, { align: 'center' });
        
        // Line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);
        
        // Invoice details
        doc.setFontSize(10);
        doc.text(`Invoice No: INV-${booking._id.toString().slice(-8)}`, 20, 60);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 60);
        doc.text(`Booking ID: ${booking._id.toString()}`, 20, 70);
        
        // Customer details
        doc.setFontSize(12);
        doc.setTextColor(40, 55, 140);
        doc.text('Customer Details:', 20, 90);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Name: ${user?.name || 'N/A'}`, 20, 100);
        doc.text(`Email: ${user?.email || 'N/A'}`, 20, 110);
        doc.text(`Phone: ${user?.phone || 'N/A'}`, 20, 120);
        
        // Service details
        doc.setFontSize(12);
        doc.setTextColor(40, 55, 140);
        doc.text('Service Details:', 20, 140);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Service Type: ${booking.serviceType || 'N/A'}`, 20, 150);
        doc.text(`Vehicle Model: ${booking.vehicleModel || 'N/A'}`, 20, 160);
        doc.text(`Vehicle Number: ${booking.vehicleNumber || 'N/A'}`, 20, 170);
        doc.text(`Preferred Date: ${new Date(booking.preferredDate).toLocaleDateString()}`, 20, 180);
        
        // Payment details
        doc.setFontSize(12);
        doc.setTextColor(40, 55, 140);
        doc.text('Payment Details:', 20, 200);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Amount: ₹${booking.finalCost || booking.estimatedCost || 0}`, 20, 210);
        doc.text(`Payment Method: ${booking.paymentMethod || 'COD'}`, 20, 220);
        doc.text(`Payment Status: ${booking.paymentStatus || 'Pending'}`, 20, 230);
        
        // Footer
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for choosing Smart Vehicle Service!', 105, 270, { align: 'center' });
        doc.text('For support, contact: support@smartvehicleservice.com | +91 98765 43210', 105, 280, { align: 'center' });
        
        // Save PDF
        const pdfPath = `invoices/invoice_${booking._id}.pdf`;
        doc.save(pdfPath);
        
        return pdfPath;
    } catch (error) {
        console.error('Invoice generation error:', error);
        return null;
    }
};

module.exports = generateInvoice;