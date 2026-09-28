const User = require('../models/User');
const Booking = require('../models/Booking');
const Mechanic = require('../models/Mechanic');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalMechanics = await User.countDocuments({ role: 'mechanic' });
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        
        const revenue = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const recentBookings = await Booking.find()
            .populate('userId', 'name')
            .sort('-createdAt')
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalMechanics,
                totalBookings,
                pendingBookings,
                completedBookings,
                totalRevenue: revenue[0]?.total || 0
            },
            recentBookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort('-createdAt');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all mechanics
// @route   GET /api/admin/mechanics
// @access  Private/Admin
// Get all mechanics
const getAllMechanics = async (req, res) => {
    try {
        const mechanics = await User.find({ role: 'mechanic' }).sort('-createdAt');
        res.json({ success: true, mechanics });
    } catch (error) {
        console.error('Error in getAllMechanics:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email phone')
            .populate('mechanicId', 'name phone')
            .sort('-createdAt');
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve booking
// @route   PUT /api/admin/approve-booking/:id
// @access  Private/Admin
const approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Assign mechanic to booking
// @route   POST /api/admin/assign-mechanic
// @access  Private/Admin
const assignMechanic = async (req, res) => {
    try {
        const { bookingId, mechanicId } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { mechanicId, status: 'assigned' },
            { new: true }
        );
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Assign mechanic to booking
const assignMechanic = async (req, res) => {
    try {
        const { bookingId, mechanicId } = req.body;

        // ✅ Verify mechanic exists
        const mechanic = await User.findById(mechanicId);
        if (!mechanic || mechanic.role !== 'mechanic') {
            return res.status(404).json({ success: false, message: 'Mechanic not found' });
        }

        // ✅ Update booking with mechanicId and status
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { 
                mechanicId: mechanicId,
                status: 'assigned'
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // ✅ Create notification for mechanic
        await Notification.create({
            userId: mechanicId,
            title: '🔧 New Job Assigned',
            message: `You have been assigned a new job: ${booking.serviceType}`,
            type: 'booking',
            relatedId: booking._id,
            isRead: false
        });

        // ✅ Create notification for admin
        await Notification.create({
            userId: req.user._id,
            title: '✅ Mechanic Assigned',
            message: `Mechanic ${mechanic.name} assigned to booking ${booking._id}`,
            type: 'booking',
            relatedId: booking._id,
            isRead: false
        });

        res.json({ success: true, booking });
    } catch (error) {
        console.error('Assign mechanic error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getStats,
    getAllUsers,
    getAllMechanics,
    getAllBookings,
    approveBooking,
    assignMechanic,
    deleteUser
};