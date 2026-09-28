const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');

const createBooking = async (req, res) => {
    try {
        console.log('🔥 BOOKING REQUEST RECEIVED');
        console.log('📧 Email to:', req.user.email);

        const booking = await Booking.create({
            ...req.body,
            userId: req.user._id,
            status: 'completed',
            paymentStatus: 'paid',
            finalCost: 500
        });

        console.log('✅ Booking created:', booking._id);

        const emailSent = await sendEmail(
            req.user.email,
            '✅ Booking Confirmed',
            `Hello ${req.user.name},\n\nYour booking is confirmed.\n\nID: ${booking._id}\nService: ${booking.serviceType}\nAmount: ₹500\n\nThank you!`
        );

        console.log('📧 Email sent:', emailSent);

        res.status(201).json({ success: true, booking });

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('userId', 'name email phone');
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addRating = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { rating, review },
            { new: true }
        );
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createBooking, getBookingById, cancelBooking, addRating };