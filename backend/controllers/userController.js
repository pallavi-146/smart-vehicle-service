const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
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
};

// @desc    Get user bookings
// @route   GET /api/user/bookings
// @access  Private
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('mechanicId', 'name phone')
            .sort('-createdAt');
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update vehicle details
// @route   PUT /api/user/vehicle
// @access  Private
const updateVehicle = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { vehicleDetails: req.body },
            { new: true }
        );
        res.json({ success: true, vehicleDetails: user.vehicleDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getProfile, updateProfile, getUserBookings, updateVehicle };