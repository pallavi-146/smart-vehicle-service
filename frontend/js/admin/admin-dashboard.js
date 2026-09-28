// Admin Dashboard JavaScript
// Handles all admin dashboard functionality

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Check authentication and role
if (!token) {
    window.location.href = '/login';
}
if (user.role !== 'admin') {
    window.location.href = '/user-dashboard';
}

// DOM Elements
let totalUsersElement, totalMechanicsElement, totalBookingsElement, totalRevenueElement;
let recentBookingsTable, userNameElement, notificationCountElement;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    userNameElement = document.getElementById('adminName');
    totalUsersElement = document.getElementById('totalUsers');
    totalMechanicsElement = document.getElementById('totalMechanics');
    totalBookingsElement = document.getElementById('totalBookings');
    totalRevenueElement = document.getElementById('totalRevenue');
    recentBookingsTable = document.getElementById('recentBookingsTable');
    notificationCountElement = document.getElementById('notificationCount');
    
    // Set admin name
    if (userNameElement && user.name) {
        userNameElement.innerText = user.name;
    }
    
    // Load dashboard data
    loadDashboardStats();
    loadRecentBookings();
    loadNotificationCount();
    
    // Initialize charts
    initializeCharts();
    
    // Auto-refresh every 30 seconds
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
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message };
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetchAPI('/api/admin/stats');
        
        if (response.success && response.stats) {
            if (totalUsersElement) totalUsersElement.innerText = response.stats.totalUsers || 0;
            if (totalMechanicsElement) totalMechanicsElement.innerText = response.stats.totalMechanics || 0;
            if (totalBookingsElement) totalBookingsElement.innerText = response.stats.totalBookings || 0;
            if (totalRevenueElement) totalRevenueElement.innerText = '₹' + (response.stats.totalRevenue || 0).toLocaleString();
        } else {
            // Demo data for testing
            if (totalUsersElement) totalUsersElement.innerText = '1,250';
            if (totalMechanicsElement) totalMechanicsElement.innerText = '48';
            if (totalBookingsElement) totalBookingsElement.innerText = '3,892';
            if (totalRevenueElement) totalRevenueElement.innerText = '₹12,45,000';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent bookings
async function loadRecentBookings() {
    if (!recentBookingsTable) return;
    
    try {
        const response = await fetchAPI('/api/admin/bookings');
        
        if (response.success && response.bookings && response.bookings.length > 0) {
            const recentBookings = response.bookings.slice(0, 10);
            displayRecentBookings(recentBookings);
        } else {
            // Demo data
            const demoBookings = [
                { _id: 'BK001', userId: { name: 'Rajesh Kumar' }, serviceType: 'Oil Change', vehicleModel: 'Maruti Swift', preferredDate: new Date(), estimatedCost: 499, status: 'pending', paymentStatus: 'pending' },
                { _id: 'BK002', userId: { name: 'Priya Singh' }, serviceType: 'Engine Repair', vehicleModel: 'Hyundai i20', preferredDate: new Date(), estimatedCost: 2499, status: 'approved', paymentStatus: 'pending' },
                { _id: 'BK003', userId: { name: 'Amit Patel' }, serviceType: 'AC Service', vehicleModel: 'Honda City', preferredDate: new Date(), estimatedCost: 1199, status: 'completed', paymentStatus: 'paid' },
                { _id: 'BK004', userId: { name: 'Sneha Sharma' }, serviceType: 'Brake Service', vehicleModel: 'Tata Nexon', preferredDate: new Date(), estimatedCost: 899, status: 'in-progress', paymentStatus: 'pending' },
                { _id: 'BK005', userId: { name: 'Vikram Singh' }, serviceType: 'Battery Replacement', vehicleModel: 'Maruti Suzuki', preferredDate: new Date(), estimatedCost: 1599, status: 'cancelled', paymentStatus: 'pending' }
            ];
            displayRecentBookings(demoBookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        recentBookingsTable.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading bookings</td></tr>';
    }
}

// Display recent bookings
function displayRecentBookings(bookings) {
    if (!recentBookingsTable) return;
    
    if (!bookings || bookings.length === 0) {
        recentBookingsTable.innerHTML = '<tr><td colspan="8" class="text-center">No bookings found</td></tr>';
        return;
    }
    
    recentBookingsTable.innerHTML = bookings.map(booking => `
        <tr data-booking-id="${booking._id}">
            <td><code>${booking._id?.slice(-8) || 'N/A'}</code></td>
            <td><strong>${booking.userId?.name || 'N/A'}</strong><br><small class="text-muted">${booking.userId?.phone || ''}</small></td>
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
                    `<button class="btn btn-sm btn-success" onclick="approveBooking('${booking._id}')">
                        <i class="fas fa-check"></i>
                    </button>` : ''}
                ${booking.status === 'approved' ? 
                    `<button class="btn btn-sm btn-primary" onclick="assignMechanic('${booking._id}')">
                        <i class="fas fa-user-cog"></i>
                    </button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Initialize charts
function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [65000, 75000, 82000, 91000, 105000, 125000, 145000, 138000, 156000, 172000, 189000, 210000],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    }
    
    // Status Distribution Chart
    const statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'],
                datasets: [{
                    data: [45, 32, 28, 156, 12],
                    backgroundColor: ['#ffc107', '#17a2b8', '#fd7e14', '#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

// Load notification count
async function loadNotificationCount() {
    try {
        const response = await fetchAPI('/api/notifications/count');
        if (response.success && notificationCountElement) {
            const count = response.count || 0;
            notificationCountElement.innerText = count;
            notificationCountElement.style.display = count > 0 ? 'inline-block' : 'none';
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
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
                    <p><strong>Customer:</strong> ${b.userId?.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${b.userId?.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> ${b.userId?.email || 'N/A'}</p>
                    <p><strong>Service:</strong> ${b.serviceType}</p>
                    <p><strong>Vehicle:</strong> ${b.vehicleModel} (${b.vehicleNumber || 'N/A'})</p>
                    <p><strong>Date:</strong> ${new Date(b.preferredDate).toLocaleString()}</p>
                    <p><strong>Status:</strong> ${b.status}</p>
                    <p><strong>Amount:</strong> ₹${b.estimatedCost || b.finalCost}</p>
                    <p><strong>Payment:</strong> ${b.paymentStatus}</p>
                    ${b.mechanicId?.name ? `<p><strong>Assigned Mechanic:</strong> ${b.mechanicId.name}</p>` : ''}
                    ${b.description ? `<p><strong>Description:</strong> ${b.description}</p>` : ''}
                </div>
            `,
            icon: 'info',
            width: '500px'
        });
    } else {
        Swal.fire('Error', 'Could not fetch booking details', 'error');
    }
};

// Approve booking
window.approveBooking = async function(bookingId) {
    const result = await Swal.fire({
        title: 'Approve Booking?',
        text: 'Are you sure you want to approve this booking?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Approve'
    });
    
    if (result.isConfirmed) {
        const response = await fetchAPI(`/api/admin/approve-booking/${bookingId}`, 'PUT');
        
        if (response.success) {
            Swal.fire('Approved!', 'Booking has been approved', 'success');
            loadRecentBookings();
            loadDashboardStats();
        } else {
            Swal.fire('Error', response.message || 'Failed to approve', 'error');
        }
    }
};

// Assign mechanic (opens modal)
window.assignMechanic = async function(bookingId) {
    // Load mechanics list
    const mechanicsResponse = await fetchAPI('/api/admin/mechanics');
    
    if (mechanicsResponse.success && mechanicsResponse.mechanics) {
        const availableMechanics = mechanicsResponse.mechanics.filter(m => m.isAvailable !== false);
        
        if (availableMechanics.length === 0) {
            Swal.fire('No Mechanics', 'No mechanics available for assignment', 'warning');
            return;
        }
        
        const mechanicOptions = availableMechanics.map(m => ({
            id: m._id,
            name: m.name,
            specialization: m.specialization || 'General'
        }));
        
        const result = await Swal.fire({
            title: 'Assign Mechanic',
            html: `
                <select id="mechanicSelect" class="swal2-select" style="width: 100%; padding: 10px;">
                    <option value="">Select a mechanic</option>
                    ${mechanicOptions.map(m => `<option value="${m.id}">${m.name} - ${m.specialization}</option>`).join('')}
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Assign',
            preConfirm: () => {
                const select = document.getElementById('mechanicSelect');
                return select.value;
            }
        });
        
        if (result.isConfirmed && result.value) {
            const assignResponse = await fetchAPI('/api/admin/assign-mechanic', 'POST', {
                bookingId: bookingId,
                mechanicId: result.value
            });
            
            if (assignResponse.success) {
                Swal.fire('Assigned!', 'Mechanic has been assigned', 'success');
                loadRecentBookings();
            } else {
                Swal.fire('Error', assignResponse.message || 'Failed to assign', 'error');
            }
        }
    } else {
        Swal.fire('Error', 'Could not load mechanics list', 'error');
    }
};

// Logout function
window.adminLogout = function() {
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

// Export functions
window.loadDashboardStats = loadDashboardStats;
window.loadRecentBookings = loadRecentBookings;