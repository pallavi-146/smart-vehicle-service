const express = require('express');
const QRCode = require('qrcode');
const { jsPDF } = require('jspdf');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Generate QR code for payment
router.post('/generate-qr', async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        const upiId = 'vehicle.service@okhdfcbank';
        const payeeName = 'Smart Vehicle Service';
        const upiString = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR`;
        
        const qrCodeUrl = await QRCode.toDataURL(upiString);
        
        res.json({ success: true, qrCode: qrCodeUrl, upiString });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Process payment
router.post('/process', async (req, res) => {
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
        
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid', status: 'confirmed' });
        
        res.json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Generate invoice
router.post('/generate-invoice', async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId).populate('userId', 'name email');
        
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Service Invoice', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Invoice ID: ${booking._id}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
        doc.text(`Customer: ${booking.userId.name}`, 20, 60);
        doc.text(`Service: ${booking.serviceType}`, 20, 70);
        doc.text(`Amount: ₹${booking.finalCost || booking.estimatedCost}`, 20, 80);
        doc.text('Thank you for choosing Smart Vehicle Service!', 105, 120, { align: 'center' });
        
        const pdfBuffer = doc.output('arraybuffer');
        
        res.json({ success: true, invoice: Buffer.from(pdfBuffer).toString('base64') });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;