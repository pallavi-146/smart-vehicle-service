const User = require('../models/User');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const sendSMS = require('../utils/sendSMS');
const sendEmail = require('../utils/sendEmail');

// @desc    Send SOS emergency alert
// @route   POST /api/sos/emergency
// @access  Public
const sendSOS = async (req, res) => {
    try {
        const { userId, location, bookingId } = req.body;
        
        const user = await User.findById(userId);
        const admin = await User.findOne({ role: 'admin' });
        
        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, { sosTriggered: true });
        }
        
        const sosMessage = `🚨 SOS EMERGENCY ALERT!
Customer: ${user?.name || userId}
Phone: ${user?.phone || 'N/A'}
Location: ${location?.lat || 'Unknown'}, ${location?.lng || 'Unknown'}
Time: ${new Date().toLocaleString()}
Booking ID: ${bookingId || 'No active booking'}
Please contact customer immediately!`;
        
        // Send to admin
        if (admin?.phone) {
            await sendSMS(admin.phone, sosMessage.substring(0, 160));
        }
        
        if (admin?.email) {
            await sendEmail(admin.email, '🚨 SOS Emergency Alert!', sosMessage);
        }
        
        // Create notification
        await Notification.create({
            userId: admin?._id,
            title: 'Emergency SOS Alert!',
            message: `Customer ${user?.name || userId} needs immediate roadside assistance!`,
            type: 'sos'
        });
        
        res.json({ 
            success: true, 
            message: 'SOS alert sent successfully. Help is on the way!' 
        });
    } catch (error) {
        console.error('SOS Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get SOS history
// @route   GET /api/sos/history
// @access  Private/Admin
const getSOSHistory = async (req, res) => {
    try {
        const sosBookings = await Booking.find({ sosTriggered: true })
            .populate('userId', 'name email phone')
            .sort('-createdAt');
        res.json({ success: true, sosBookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { sendSOS, getSOSHistory };