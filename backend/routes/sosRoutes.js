const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const sendSMS = require('../utils/sendSMS');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

router.post('/emergency', async (req, res) => {
    try {
        const { userId, location, bookingId } = req.body;
        
        const user = await User.findById(userId);
        const admin = await User.findOne({ role: 'admin' });
        
        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, { sosTriggered: true });
        }
        
        const sosMessage = `🚨 SOS ALERT! 
Customer: ${user?.name || userId}
Phone: ${user?.phone || 'Not available'}
Location: ${location?.lat || 'Unknown'}, ${location?.lng || 'Unknown'}
Time: ${new Date().toLocaleString()}
Booking ID: ${bookingId || 'No active booking'}`;
        
        // Send SMS to admin
        if (admin?.phone) {
            await sendSMS(admin.phone, sosMessage.substring(0, 160));
        }
        
        // Send Email to admin
        if (admin?.email) {
            await sendEmail(admin.email, '🚨 SOS Emergency Alert', sosMessage);
        }
        
        // Create notification
        await Notification.create({
            userId: admin?._id,
            title: 'Emergency SOS Alert!',
            message: `Customer ${user?.name || userId} needs immediate assistance!`,
            type: 'sos'
        });
        
        res.json({ success: true, message: 'SOS alert sent successfully' });
    } catch (error) {
        console.error('SOS Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;