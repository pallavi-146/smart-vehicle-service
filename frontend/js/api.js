// API service for backend calls

const API_BASE = '/api';

// Helper for API calls
async function callAPI(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth APIs
const authAPI = {
    login: (email, password, role) => callAPI('/auth/login', 'POST', { email, password, role }),
    register: (userData) => callAPI('/auth/register', 'POST', userData),
    getMe: () => callAPI('/auth/me')
};

// User APIs
const userAPI = {
    getProfile: () => callAPI('/user/profile'),
    updateProfile: (data) => callAPI('/user/profile', 'PUT', data),
    getBookings: () => callAPI('/user/bookings'),
    updateVehicle: (data) => callAPI('/user/vehicle', 'PUT', data)
};

// Booking APIs
const bookingAPI = {
    create: (data) => callAPI('/bookings/create', 'POST', data),
    getById: (id) => callAPI(`/bookings/${id}`),
    cancel: (id, reason) => callAPI(`/bookings/cancel/${id}`, 'PUT', { reason }),
    rate: (id, rating, review) => callAPI(`/bookings/rate/${id}`, 'POST', { rating, review })
};

// Admin APIs
const adminAPI = {
    getStats: () => callAPI('/admin/stats'),
    getUsers: () => callAPI('/admin/users'),
    getMechanics: () => callAPI('/admin/mechanics'),
    getBookings: () => callAPI('/admin/bookings'),
    approveBooking: (id) => callAPI(`/admin/approve-booking/${id}`, 'PUT'),
    assignMechanic: (bookingId, mechanicId) => callAPI('/admin/assign-mechanic', 'POST', { bookingId, mechanicId }),
    deleteUser: (id) => callAPI(`/admin/user/${id}`, 'DELETE')
};

// Mechanic APIs
const mechanicAPI = {
    getJobs: () => callAPI('/mechanic/jobs'),
    updateJobStatus: (id, status) => callAPI(`/mechanic/job/${id}/status`, 'PUT', { status }),
    updateAvailability: (isAvailable) => callAPI('/mechanic/availability', 'PUT', { isAvailable }),
    updateLocation: (lat, lng) => callAPI('/mechanic/location', 'PUT', { lat, lng })
};

// Payment APIs
const paymentAPI = {
    generateQR: (amount, bookingId) => callAPI('/payments/generate-qr', 'POST', { amount, bookingId }),
    processPayment: (bookingId, amount, method, transactionId) => callAPI('/payments/process', 'POST', { bookingId, amount, method, transactionId }),
    generateInvoice: (bookingId) => callAPI('/payments/generate-invoice', 'POST', { bookingId }),
    getHistory: () => callAPI('/payments/history')
};

// SOS API
const sosAPI = {
    send: (userId, location, bookingId) => callAPI('/sos/emergency', 'POST', { userId, location, bookingId }),
    getHistory: () => callAPI('/sos/history')
};

// Reminder API
const reminderAPI = {
    getMyReminders: () => callAPI('/reminders/my-reminders'),
    create: (data) => callAPI('/reminders/create', 'POST', data)
};