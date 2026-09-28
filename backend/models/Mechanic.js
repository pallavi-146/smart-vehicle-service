const mongoose = require('mongoose');

const MechanicSchema = new mongoose.Schema({
    // User reference (for login)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Personal Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    
    // Professional Info
    vehicleType: { 
        type: String, 
        enum: ['Car', 'Bike', 'Scooter', 'All'], 
        default: 'All',
        required: true 
    },
    specialization: [{ 
        type: String,
        enum: [
            'Engine Repair', 'Oil Change', 'AC Service', 'Brake Service',
            'Battery Replacement', 'Towing Service', 'Tyre Replacement',
            'Full Service', 'Engine Tuning', 'General Service', 'Car Wash',
            'Wheel Alignment', 'Dent Paint', 'Suspension Repair'
        ]
    }],
    
    // Availability
    isAvailable: { type: Boolean, default: true },
    availableFrom: { type: String, default: '09:00' },
    availableTo: { type: String, default: '18:00' },
    
    // Performance Stats
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    
    // Earnings
    earnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    paidEarnings: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 },
    commissionPercentage: { type: Number, default: 60 },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mechanic', MechanicSchema);