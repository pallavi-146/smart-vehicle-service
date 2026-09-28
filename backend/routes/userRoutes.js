const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Get profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update profile
router.put('/profile', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('mechanicId', 'name phone')
            .sort('-createdAt');
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;