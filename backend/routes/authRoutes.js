const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register - Only for Users (Mechanics cannot self-register)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        
        // Block mechanic self-registration
        if (role === 'mechanic') {
            return res.status(403).json({ 
                success: false, 
                message: 'Mechanic accounts can only be created by Admin. Please contact administrator.' 
            });
        }
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        
        // Only allow 'user' role for self-registration
        const user = await User.create({ 
            name, 
            email, 
            password, 
            phone, 
            role: 'user'  // Force role to be 'user'
        });
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });
        
        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login - Works for all roles (User, Mechanic, Admin)
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        const user = await User.findOne({ email, role }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        user.lastLogin = Date.now();
        await user.save();
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });
        
        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get current user
router.get('/me', protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;