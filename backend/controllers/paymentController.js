const QRCode = require('qrcode');
const { jsPDF } = require('jspdf');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Generate QR code
// @route   POST /api/payments/generate-qr
// @access  Private
const generateQR = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        const upiId = 'vehicle.service@okhdfcbank';
        const payeeName = 'Smart Vehicle Service';
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;
        
        const qrCodeUrl = await QRCode.toDataURL(upiString);
        res.json({ success: true, qrCode: qrCodeUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============ GENERATE INVOICE (Helper Function) ============
const generateInvoicePDF = async (booking, user) => {
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
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, 60);
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
        doc.text(`Date: ${new Date(booking.preferredDate).toLocaleDateString('en-IN')}`, 20, 180);
        
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
        
        // Return as base64
        const pdfBuffer = doc.output('arraybuffer');
        return Buffer.from(pdfBuffer).toString('base64');
    } catch (error) {
        console.error('Invoice generation error:', error);
        return null;
    }
};

// @desc    Process payment
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res) => {
    try {
        const { bookingId, amount, method, transactionId } = req.body;
        
        const payment = await Payment.create({
            bookingId,
            userId: req.user._id,
            amount,
            method,
            status: 'success',
            transactionId,
            paymentDate: new Date()
        });
        
        const booking = await Booking.findByIdAndUpdate(bookingId, { 
            paymentStatus: 'paid', 
            status: 'confirmed',
            finalCost: amount,
            paymentMethod: method
        }, { new: true }).populate('userId');

        // ✅ GENERATE INVOICE PDF
        const invoiceBase64 = await generateInvoicePDF(booking, booking.userId);

        // ✅ SEND EMAIL WITH INVOICE
        if (booking && booking.userId && booking.userId.email) {
            await sendEmail(
                booking.userId.email,
                '💰 Payment Successful - Smart Vehicle Service',
                `Dear ${booking.userId.name},\n\nPayment received successfully!\n\n📋 Booking ID: ${bookingId}\n💰 Amount Paid: ₹${amount}\n💳 Payment Method: ${method}\n🆔 Transaction ID: ${transactionId}\n📄 Invoice attached below\n\nThank you for choosing Smart Vehicle Service.\n\n- Team Smart Vehicle`
            );
        }
        
        res.json({ 
            success: true, 
            payment,
            invoice: invoiceBase64,
            booking: booking
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate invoice (API route)
// @route   POST /api/payments/generate-invoice
// @access  Private
const generateInvoice = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId).populate('userId', 'name email phone');
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        const invoiceBase64 = await generateInvoicePDF(booking, booking.userId);
        
        res.json({ success: true, invoice: invoiceBase64 });
    } catch (error) {
        console.error('Generate invoice error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id })
            .populate('bookingId')
            .sort('-createdAt');
        res.json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    generateQR, 
    processPayment, 
    generateInvoice, 
    getPaymentHistory 
};