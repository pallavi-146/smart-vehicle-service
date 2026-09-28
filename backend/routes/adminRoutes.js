const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Mechanic = require('../models/Mechanic');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require admin authentication
router.use(protect, roleCheck('admin'));

// ============ DASHBOARD STATS ============
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalMechanics = await User.countDocuments({ role: 'mechanic' });
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const totalRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$finalCost' } } }
        ]);
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalMechanics,
                totalBookings,
                pendingBookings,
                completedBookings,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ USER MANAGEMENT ============
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort('-createdAt');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ MECHANIC MANAGEMENT (Admin Only) ============

// Add mechanic (Admin creates account)
router.post('/add-mechanic', async (req, res) => {
    try {
        const { name, email, phone, password, vehicleType, specialization, experience } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        
        // Create User account for mechanic
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'mechanic',
            isActive: true
        });
        
        // Create Mechanic profile
        const mechanic = await Mechanic.create({
            userId: user._id,
            name,
            email,
            phone,
            vehicleType: vehicleType || 'All',
            specialization: specialization || [],
            experience: experience || 0,
            isAvailable: true
        });
        
        res.status(201).json({ 
            success: true, 
            message: 'Mechanic created successfully',
            mechanic: {
                _id: mechanic._id,
                name: mechanic.name,
                email: mechanic.email,
                phone: mechanic.phone,
                vehicleType: mechanic.vehicleType,
                specialization: mechanic.specialization,
                isAvailable: mechanic.isAvailable
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all mechanics with filters
router.get('/mechanics-filter', async (req, res) => {
    try {
        const { vehicleType, specialization, isAvailable } = req.query;
        let filter = {};
        
        if (vehicleType && vehicleType !== 'All') {
            filter.vehicleType = { $in: [vehicleType, 'All'] };
        }
        if (specialization) {
            filter.specialization = { $in: [specialization] };
        }
        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === 'true';
        }
        
        const mechanics = await Mechanic.find(filter).sort('-createdAt');
        res.json({ success: true, mechanics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all mechanics (simple list)
router.get('/mechanics', async (req, res) => {
    try {
        const mechanics = await Mechanic.find().sort('-createdAt');
        res.json({ success: true, mechanics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update mechanic
router.put('/update-mechanic/:id', async (req, res) => {
    try {
        const { name, phone, vehicleType, specialization, experience, isAvailable } = req.body;
        
        const mechanic = await Mechanic.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                phone, 
                vehicleType, 
                specialization, 
                experience, 
                isAvailable, 
                updatedAt: Date.now()
            },
            { new: true }
        );
        
        // Update User collection as well
        if (mechanic) {
            await User.findByIdAndUpdate(mechanic.userId, { name, phone });
        }
        
        res.json({ success: true, mechanic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete mechanic
router.delete('/delete-mechanic/:id', async (req, res) => {
    try {
        const mechanic = await Mechanic.findById(req.params.id);
        if (!mechanic) {
            return res.status(404).json({ success: false, message: 'Mechanic not found' });
        }
        
        // Delete User account
        await User.findByIdAndDelete(mechanic.userId);
        // Delete Mechanic profile
        await Mechanic.findByIdAndDelete(req.params.id);
        
        res.json({ success: true, message: 'Mechanic deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ BOOKING MANAGEMENT ============
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email phone')
            .populate('mechanicId', 'name phone')
            .sort('-createdAt');
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/approve-booking/:id', async (req, res) => {
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
});

// Assign mechanic to booking (with specialization check)
router.put('/assign-mechanic', async (req, res) => {
    try {
        const { bookingId, mechanicId } = req.body;
        
        const booking = await Booking.findById(bookingId);
        const mechanic = await Mechanic.findById(mechanicId);
        
        if (!mechanic) {
            return res.status(404).json({ success: false, message: 'Mechanic not found' });
        }
        
        // Check if mechanic specializes in this service type
        if (!mechanic.specialization.includes(booking.serviceType) && 
            !mechanic.specialization.includes('Full Service')) {
            return res.status(400).json({ 
                success: false, 
                message: `Mechanic does not specialize in ${booking.serviceType}` 
            });
        }
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { mechanicId: mechanic.userId, status: 'assigned' },
            { new: true }
        );
        
        res.json({ success: true, booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get mechanics by service type (for assignment dropdown)
router.get('/mechanics-by-service/:serviceType', async (req, res) => {
    try {
        const { serviceType } = req.params;
        const mechanics = await Mechanic.find({
            isAvailable: true,
            $or: [
                { specialization: serviceType },
                { specialization: 'Full Service' },
                { specialization: 'General Service' }
            ]
        });
        
        res.json({ success: true, mechanics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ MECHANIC COMMISSION MANAGEMENT ============
router.put('/mechanic-commission/:id', async (req, res) => {
    try {
        const { commissionPercentage } = req.body;
        const mechanic = await Mechanic.findOneAndUpdate(
            { userId: req.params.id },
            { commissionPercentage },
            { new: true, upsert: true }
        );
        res.json({ success: true, mechanic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/mechanics-commission', async (req, res) => {
    try {
        const mechanics = await User.find({ role: 'mechanic' }).select('name email phone');
        const mechanicDetails = await Promise.all(mechanics.map(async (m) => {
            const mech = await Mechanic.findOne({ userId: m._id });
            return {
                _id: m._id,
                name: m.name,
                email: m.email,
                phone: m.phone,
                commissionPercentage: mech?.commissionPercentage || 60,
                earnings: mech?.earnings || 0
            };
        }));
        res.json({ success: true, mechanics: mechanicDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/mechanics-earnings', async (req, res) => {
    try {
        const mechanics = await User.find({ role: 'mechanic' }).select('name email phone');
        const mechanicDetails = await Promise.all(mechanics.map(async (m) => {
            const mech = await Mechanic.findOne({ userId: m._id });
            return {
                _id: m._id,
                name: m.name,
                email: m.email,
                phone: m.phone,
                earnings: mech?.earnings || 0,
                paidEarnings: mech?.paidEarnings || 0,
                pendingEarnings: (mech?.earnings || 0) - (mech?.paidEarnings || 0)
            };
        }));
        res.json({ success: true, mechanics: mechanicDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/pay-mechanic', async (req, res) => {
    try {
        const { mechanicId, amount } = req.body;
        
        const mechanic = await Mechanic.findOne({ userId: mechanicId });
        if (!mechanic) {
            return res.status(404).json({ success: false, message: 'Mechanic not found' });
        }
        
        mechanic.paidEarnings = (mechanic.paidEarnings || 0) + amount;
        mechanic.pendingEarnings = (mechanic.earnings || 0) - mechanic.paidEarnings;
        mechanic.lastPayoutDate = new Date();
        mechanic.payoutHistory = mechanic.payoutHistory || [];
        mechanic.payoutHistory.push({ amount, date: new Date(), status: 'completed' });
        
        await mechanic.save();
        
        res.json({ success: true, message: `₹${amount} paid to mechanic successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;