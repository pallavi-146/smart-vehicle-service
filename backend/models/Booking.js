const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceType: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    description: String,
    preferredDate: { type: Date, required: true },
    preferredTime: String,
    location: {
        address: String, lat: Number, lng: Number
    },
    estimatedCost: Number,
    finalCost: Number,
    status: {
        type: String,
        enum: ['pending', 'approved', 'assigned', 'in-progress', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    paymentMethod: { type: String, enum: ['QR', 'COD', 'Card'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentId: String,
    invoiceUrl: String,
    sosTriggered: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    cancelledBy: { type: String, enum: ['user', 'admin', 'mechanic'] },
    cancellationReason: String,
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);