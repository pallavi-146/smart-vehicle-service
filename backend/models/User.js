const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    role: { type: String, enum: ['user', 'mechanic', 'admin'], default: 'user' },
    profileImage: { type: String, default: 'default-avatar.png' },
    address: {
        street: String, city: String, state: String, pincode: String, country: { type: String, default: 'India' }
    },
    vehicleDetails: {
        make: String, model: String, year: Number, licensePlate: String, color: String
    },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);