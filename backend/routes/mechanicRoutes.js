const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, roleCheck('mechanic'));

// ✅ GET ACTIVE BOOKINGS ONLY (No cancelled)
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await Booking.find({
            status: { $ne: 'cancelled' }
        })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });

        console.log('📋 Active jobs found:', jobs.length);

        res.json({ 
            success: true, 
            jobs: jobs 
        });
    } catch (error) {
        console.error('Jobs error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ UPDATE JOB STATUS
router.put('/job/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;