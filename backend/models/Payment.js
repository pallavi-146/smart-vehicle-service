const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['QR', 'COD', 'Card'], required: true },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    qrCodeUrl: String,
    invoiceUrl: String,
    paymentDate: Date,
    refundAmount: Number,
    refundReason: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);