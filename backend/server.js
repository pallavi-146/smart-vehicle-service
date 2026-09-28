const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mechanicRoutes = require('./routes/mechanicRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const sosRoutes = require('./routes/sosRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'secretkey', 
    resave: false, 
    saveUninitialized: false 
}));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
const MONGO_URI = "mongodb+srv://admin_user:pallavi123@cluster0.e21q6ln.mongodb.net/smart_vehicle_service?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mechanic', mechanicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);  // ✅ ADDED HERE

// Helper function for Indian date format
const formatIndianDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// ============ TEST EMAIL ROUTES ============
app.get('/testmail', async (req, res) => {
    const sendEmail = require('./utils/sendEmail');
    const result = await sendEmail('pallavi14062@gmail.com', 'Test Email from Vehicle Service', '✅ If you receive this, your email system is working perfectly!');
    res.json({ 
        success: result, 
        message: result ? 'Email sent! Check your inbox/spam folder' : 'Failed to send email',
        email: 'pallavi14062@gmail.com'
    });
});

// Direct test for booking email with Indian date format
app.get('/test-booking-email', async (req, res) => {
    const sendEmail = require('./utils/sendEmail');
    const currentDate = formatIndianDate(new Date());
    
    const result = await sendEmail(
        'pallavi14062@gmail.com',
        '✅ Booking Confirmed - Smart Vehicle Service',
        `Dear Customer,\n\nYour service booking has been confirmed!\n\n📋 Booking ID: TEST123\n🔧 Service: Oil Change\n📅 Date: ${currentDate}\n💰 Amount: ₹499\n\nThank you for choosing Smart Vehicle Service.\n\n- Team Smart Vehicle`
    );
    res.json({ 
        success: result, 
        message: result ? 'Booking email sent! Check your inbox' : 'Failed to send',
        date: currentDate
    });
});

// ============ HTML PAGE ROUTES ============
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '../frontend/index.html');
    console.log('Serving:', filePath);
    res.sendFile(filePath);
});

app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, '../frontend/login.html');
    console.log('Serving login page:', filePath);
    res.sendFile(filePath);
});

app.get('/register', (req, res) => {
    const filePath = path.join(__dirname, '../frontend/register.html');
    console.log('Serving register page:', filePath);
    res.sendFile(filePath);
});

app.get('/user-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/user/user-dashboard.html'));
});

app.get('/mechanic-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/mechanic/mechanic-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/admin/admin-dashboard.html'));
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });
    
    socket.on('trackService', (bookingId) => {
        console.log(`Tracking service: ${bookingId}`);
        let interval = setInterval(() => {
            socket.emit('locationUpdate', {
                lat: 28.6139 + Math.random() * 0.01,
                lng: 77.2090 + Math.random() * 0.01,
                status: 'en-route'
            });
        }, 5000);
        
        socket.on('disconnect', () => {
            clearInterval(interval);
        });
    });
    
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Cron job for reminders
cron.schedule('0 9 * * *', async () => {
    console.log('Running daily service reminder check...');
    try {
        const { sendServiceReminders } = require('./utils/socketHelper');
        await sendServiceReminders();
    } catch (error) {
        console.error('Reminder cron error:', error);
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ 
        success: false, 
        message: err.message || 'Server error' 
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
    console.log(`🔐 Try: http://localhost:${PORT}/login`);
    console.log(`📝 Try: http://localhost:${PORT}/register`);
    console.log(`📧 Test email: http://localhost:${PORT}/testmail`);
    console.log(`📧 Test booking email: http://localhost:${PORT}/test-booking-email`);
});