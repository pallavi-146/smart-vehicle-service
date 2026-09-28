const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = "mongodb+srv://admin_user:pallavi123@cluster0.e21q6ln.mongodb.net/smart_vehicle_service?appName=Cluster0";

// Simple user schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    role: String,
    isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Check if admin exists
        const existing = await User.findOne({ email: 'admin@vehicleservice.com' });
        
        if (existing) {
            console.log('Admin already exists!');
            console.log('Email: admin@vehicleservice.com');
            console.log('Password: Admin@123');
        } else {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            const admin = new User({
                name: 'Super Admin',
                email: 'admin@vehicleservice.com',
                password: hashedPassword,
                phone: '9876543210',
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Admin created!');
            console.log('Email: admin@vehicleservice.com');
            console.log('Password: Admin@123');
        }
        
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdmin();