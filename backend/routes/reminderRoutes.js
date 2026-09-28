const express = require('express');
const ServiceReminder = require('../models/ServiceReminder');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

const router = express.Router();

router.use(protect);

// Get user reminders
router.get('/my-reminders', async (req, res) => {
    try {
        const reminders = await ServiceReminder.find({ userId: req.user._id })
            .sort({ dueDate: 1 });
        res.json({ success: true, reminders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create reminder
router.post('/create', async (req, res) => {
    try {
        const reminder = await ServiceReminder.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json({ success: true, reminder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;