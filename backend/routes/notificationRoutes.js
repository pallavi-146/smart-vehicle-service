const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

// Get all notifications (for admin)
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get unread count
router.get('/count', async (req, res) => {
    try {
        const count = await Notification.countDocuments({ isRead: false });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;