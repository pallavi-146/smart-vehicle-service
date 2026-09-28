const express = require('express');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

const router = express.Router();

router.use(protect);

// Create booking
router.post('/create', async (req, res) => {
    try {
        const booking = await Booking.create({
            ...req.body,
            userId: req.user._id
        });
        
        // Send notification to admin
        await Notification.create({
            userId: req.user._id,
            title: 'New Booking Request',
            message: `New booking request for ${booking.serviceType}`,
            type: 'booking',
            relatedId: booking._id
        });
        
        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('mechanicId', 'name phone');
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cancel booking
router.put('/cancel/:id', async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled', cancellationReason: reason, cancelledBy: req.user.role },
            { new: true }
        );
        
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;