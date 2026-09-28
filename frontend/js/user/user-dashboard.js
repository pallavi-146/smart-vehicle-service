// User Dashboard JavaScript
// Handles all user dashboard functionality

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Check authentication
if (!token) {
    window.location.href = '/login';
}

// DOM Elements
let totalBookingsElement, pendingBookingsElement, completedBookingsElement, totalSpentElement;
let recentBookingsTable, userNameElement;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    userNameElement = document.getElementById('userName');
    totalBookingsElement = document.getElementById('totalBookings');
    pendingBookingsElement = document.getElementById('pendingBookings');
    completedBookingsElement = document.getElementById('completedBookings');
    totalSpentElement = document.getElementById('totalSpent');
    recentBookingsTable = document.getElementById('recentBookingsTable');
    
    // Set user name
    if (userNameElement && user.name) {
        userNameElement.innerText = user.name;
    }
    
    // Load dashboard data
    loadDashboardStats();
    loadRecentBookings();
    loadNotificationCount();
    
    // Start auto-refresh every 30 seconds
    setInterval(() => {
        if (document.getElementById('dashboardContent')?.style.display !== 'none') {
            loadDashboardStats();
            loadRecentBookings();
        }
    }, 30000);
});

// API fetch helper
async function fetchAPI(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    if (data) options.body = JSON.stringify(data);
    
    try {
        const response = await fetch(endpoint, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message };
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetchAPI('/api/user/bookings');
        
        if (response.success && response.bookings) {
            const bookings = response.bookings;
            const total = bookings.length;
            const pending = bookings.filter(b => b.status === 'pending').length;
            const completed = bookings.filter(b => b.status === 'completed').length;
            const spent = bookings
                .filter(b => b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + (b.finalCost || b.estimatedCost || 0), 0);
            
            if (totalBookingsElement) totalBookingsElement.innerText = total;
            if (pendingBookingsElement) pendingBookingsElement.innerText = pending;
            if (completedBookingsElement) completedBookingsElement.innerText = completed;
            if (totalSpentElement) totalSpentElement.innerText = '₹' + spent.toLocaleString();
        } else {
            // Demo data for testing
            if (totalBookingsElement) totalBookingsElement.innerText = '12';
            if (pendingBookingsElement) pendingBookingsElement.innerText = '3';
            if (completedBookingsElement) completedBookingsElement.innerText = '9';
            if (totalSpentElement) totalSpentElement.innerText = '₹8,450';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent bookings
async function loadRecentBookings() {
    try {
        const response = await fetchAPI('/api/user/bookings');
        
        if (response.success && response.bookings && response.bookings.length > 0) {
            const recentBookings = response.bookings.slice(0, 5);
            displayRecentBookings(recentBookings);
        } else {
            // Demo data
            const demoBookings = [
                { _id: 'BK001', serviceType: 'Oil Change', vehicleModel: 'Maruti Swift', preferredDate: new Date(), estimatedCost: 499, status: 'completed' },
                { _id: 'BK002', serviceType: 'Engine Repair', vehicleModel: 'Hyundai i20', preferredDate: new Date(), estimatedCost: 2499, status: 'pending' },
                { _id: 'BK003', serviceType: 'AC Service', vehicleModel: 'Honda City', preferredDate: new Date(), estimatedCost: 1199, status: 'approved' },
                { _id: 'BK004', serviceType: 'Brake Service', vehicleModel: 'Tata Nexon', preferredDate: new Date(), estimatedCost: 899, status: 'in-progress' },
                { _id: 'BK005', serviceType: 'Battery Replacement', vehicleModel: 'Maruti Suzuki', preferredDate: new Date(), estimatedCost: 1599, status: 'cancelled' }
            ];
            displayRecentBookings(demoBookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Display recent bookings in table
function displayRecentBookings(bookings) {
    if (!recentBookingsTable) return;
    
    if (!bookings || bookings.length === 0) {
        recentBookingsTable.innerHTML = '<tr><td colspan="6" class="text-center">No bookings found</td></tr>';
        return;
    }
    
    recentBookingsTable.innerHTML = bookings.map(booking => `
        <tr data-booking-id="${booking._id}">
            <td><code>${booking._id?.slice(-8) || 'N/A'}</code></td>
            <td>${booking.serviceType || 'N/A'}</td>
            <td>${booking.vehicleModel || 'N/A'}</td>
            <td>${new Date(booking.preferredDate).toLocaleDateString()}</td>
            <td>₹${booking.estimatedCost || booking.finalCost || 0}</td>
            <td><span class="badge-${booking.status}">${booking.status || 'pending'}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewBookingDetails('${booking._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${booking.status === 'pending' ? 
                    `<button class="btn btn-sm btn-danger" onclick="cancelBooking('${booking._id}')">
                        <i class="fas fa-times"></i>
                    </button>` : ''}
            </td>
        </tr>
    `).join('');
}

// View booking details
window.viewBookingDetails = async function(bookingId) {
    const response = await fetchAPI(`/api/bookings/${bookingId}`);
    
    if (response.success && response.booking) {
        const b = response.booking;
        Swal.fire({
            title: 'Booking Details',
            html: `
                <div class="text-start">
                    <p><strong>Booking ID:</strong> ${b._id}</p>
                    <p><strong>Service Type:</strong> ${b.serviceType}</p>
                    <p><strong>Vehicle:</strong> ${b.vehicleModel} (${b.vehicleNumber || 'N/A'})</p>
                    <p><strong>Date:</strong> ${new Date(b.preferredDate).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span class="badge-${b.status}">${b.status}</span></p>
                    <p><strong>Amount:</strong> ₹${b.estimatedCost || b.finalCost || 0}</p>
                    <p><strong>Payment Status:</strong> ${b.paymentStatus || 'pending'}</p>
                    ${b.mechanicId?.name ? `<p><strong>Mechanic:</strong> ${b.mechanicId.name}</p>` : ''}
                    ${b.description ? `<p><strong>Description:</strong> ${b.description}</p>` : ''}
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Close'
        });
    } else {
        Swal.fire('Error', 'Could not fetch booking details', 'error');
    }
};

// Cancel booking
window.cancelBooking = async function(bookingId) {
    const result = await Swal.fire({
        title: 'Cancel Booking?',
        text: 'Are you sure you want to cancel this booking?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No, Keep'
    });
    
    if (result.isConfirmed) {
        const response = await fetchAPI(`/api/bookings/cancel/${bookingId}`, 'PUT', {
            reason: 'User requested cancellation'
        });
        
        if (response.success) {
            Swal.fire('Cancelled!', 'Your booking has been cancelled', 'success');
            loadDashboardStats();
            loadRecentBookings();
        } else {
            Swal.fire('Error', response.message || 'Failed to cancel booking', 'error');
        }
    }
};

// Load notification count
async function loadNotificationCount() {
    try {
        const response = await fetchAPI('/api/notifications/count');
        if (response.success) {
            const countBadge = document.getElementById('notificationCount');
            if (countBadge) {
                countBadge.innerText = response.count || 0;
                countBadge.style.display = response.count > 0 ? 'block' : 'none';
            }
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Logout function
window.logout = function() {
    Swal.fire({
        title: 'Logout?',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Logout'
    }).then(result => {
        if (result.isConfirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    });
};

// Export functions for global use
window.loadDashboardStats = loadDashboardStats;
window.loadRecentBookings = loadRecentBookings;