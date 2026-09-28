const mongoose = require('mongoose');

const ServiceReminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNumber: String,
    reminderType: { type: String, enum: ['oil_change', 'service', 'insurance', 'puc', 'tyre'], required: true },
    dueDate: { type: Date, required: true },
    message: String,
    isSent: { type: Boolean, default: false },
    sentAt: Date,
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ServiceReminder', ServiceReminderSchema);