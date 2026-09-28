// Admin Approvals JavaScript
// Handles booking approvals, mechanic assignments, and user management

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
let pendingApprovalsTable, mechanicsList, usersList;

// Initialize approvals page
document.addEventListener('DOMContentLoaded', () => {
    pendingApprovalsTable = document.getElementById('pendingApprovalsTable');
    mechanicsList = document.getElementById('mechanicsList');
    usersList = document.getElementById('usersList');
    
    loadPendingApprovals();
    loadMechanics();
    loadUsers();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadPendingApprovals();
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

// Load pending approvals
async function loadPendingApprovals() {
    if (!pendingApprovalsTable) return;
    
    try {
        const response = await fetchAPI('/api/admin/bookings');
        
        if (response.success && response.bookings) {
            const pendingBookings = response.bookings.filter(b => b.status === 'pending');
            displayPendingApprovals(pendingBookings);
        } else {
            // Demo data
            const demoPending = [
                { _id: 'BK001', userId: { name: 'Rajesh Kumar', phone: '9876543210' }, serviceType: 'Engine Repair', vehicleModel: 'Maruti Swift', preferredDate: new Date(), estimatedCost: 2499 },
                { _id: 'BK002', userId: { name: 'Priya Singh', phone: '9876543211' }, serviceType: 'AC Service', vehicleModel: 'Hyundai i20', preferredDate: new Date(), estimatedCost: 1199 }
            ];
            displayPendingApprovals(demoPending);
        }
    } catch (error) {
        console.error('Error loading approvals:', error);
    }
}

// Display pending approvals
function displayPendingApprovals(bookings) {
    if (!pendingApprovalsTable) return;
    
    if (!bookings || bookings.length === 0) {
        pendingApprovalsTable.innerHTML = '<tr><td colspan="8" class="text-center">No pending approvals</td></tr>';
        return;
    }
    
    pendingApprovalsTable.innerHTML = bookings.map(booking => `
        <tr data-booking-id="${booking._id}">
            <td><code>${booking._id?.slice(-8) || 'N/A'}</code></td>
            <td><strong>${booking.userId?.name || 'N/A'}</strong><br><small>${booking.userId?.phone || ''}</small></td>
            <td>${booking.serviceType || 'N/A'}</td>
            <td>${booking.vehicleModel || 'N/A'}</td>
            <td>${new Date(booking.preferredDate).toLocaleDateString()}</td>
            <td>₹${booking.estimatedCost || 0}</td>
            <td>
                <button class="btn btn-sm btn-success me-1" onclick="approveBooking('${booking._id}')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectBooking('${booking._id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewCustomerDetails('${booking.userId?._id}')">
                    <i class="fas fa-user"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

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
            loadPendingApprovals();
        } else {
            Swal.fire('Error', response.message || 'Failed to approve', 'error');
        }
    }
};

// Reject booking
window.rejectBooking = async function(bookingId) {
    const { value: reason } = await Swal.fire({
        title: 'Reject Booking',
        input: 'textarea',
        inputLabel: 'Reason for rejection',
        inputPlaceholder: 'Enter reason...',
        showCancelButton: true,
        confirmButtonText: 'Reject',
        confirmButtonColor: '#dc3545'
    });
    
    if (reason) {
        const response = await fetchAPI(`/api/bookings/cancel/${bookingId}`, 'PUT', {
            reason: reason,
            cancelledBy: 'admin'
        });
        
        if (response.success) {
            Swal.fire('Rejected!', 'Booking has been rejected', 'success');
            loadPendingApprovals();
        } else {
            Swal.fire('Error', response.message || 'Failed to reject', 'error');
        }
    }
};

// Load mechanics list
async function loadMechanics() {
    if (!mechanicsList) return;
    
    try {
        const response = await fetchAPI('/api/admin/mechanics');
        
        if (response.success && response.mechanics) {
            displayMechanics(response.mechanics);
        } else {
            // Demo data
            const demoMechanics = [
                { _id: 'M001', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', specialization: 'Engine Expert', experience: 5, isAvailable: true, rating: 4.5 },
                { _id: 'M002', name: 'Suresh Patel', email: 'suresh@example.com', phone: '9876543211', specialization: 'AC Specialist', experience: 3, isAvailable: true, rating: 4.2 }
            ];
            displayMechanics(demoMechanics);
        }
    } catch (error) {
        console.error('Error loading mechanics:', error);
    }
}

// Display mechanics
function displayMechanics(mechanics) {
    if (!mechanicsList) return;
    
    if (!mechanics || mechanics.length === 0) {
        mechanicsList.innerHTML = '</tr><td colspan="7" class="text-center">No mechanics found</td></tr>';
        return;
    }
    
    mechanicsList.innerHTML = mechanics.map(m => `
        <tr>
            <td><strong>${m.name || 'N/A'}</strong></td>
            <td>${m.email || 'N/A'}</td>
            <td>${m.phone || 'N/A'}</td>
            <td>${m.specialization || 'General'}</td>
            <td>${m.experience || 0} years</td>
            <td><span class="badge ${m.isAvailable ? 'bg-success' : 'bg-danger'}">${m.isAvailable ? 'Available' : 'Offline'}</span></td>
            <td>⭐ ${m.rating || 0}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editMechanic('${m._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMechanic('${m._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load users list
async function loadUsers() {
    if (!usersList) return;
    
    try {
        const response = await fetchAPI('/api/admin/users');
        
        if (response.success && response.users) {
            displayUsers(response.users);
        } else {
            // Demo data
            const demoUsers = [
                { _id: 'U001', name: 'Amit Sharma', email: 'amit@example.com', phone: '9876543212', bookingsCount: 5, totalSpent: 5000, isActive: true, createdAt: new Date() },
                { _id: 'U002', name: 'Priya Singh', email: 'priya@example.com', phone: '9876543213', bookingsCount: 3, totalSpent: 3000, isActive: true, createdAt: new Date() }
            ];
            displayUsers(demoUsers);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Display users
function displayUsers(users) {
    if (!usersList) return;
    
    if (!users || users.length === 0) {
        usersList.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
        return;
    }
    
    usersList.innerHTML = users.map(u => `
        <tr>
            <td><strong>${u.name || 'N/A'}</strong></td>
            <td>${u.email || 'N/A'}</td>
            <td>${u.phone || 'N/A'}</td>
            <td><span class="badge bg-primary">${u.bookingsCount || 0}</span></td>
            <td>₹${(u.totalSpent || 0).toLocaleString()}</td>
            <td><span class="badge ${u.isActive ? 'bg-success' : 'bg-danger'}">${u.isActive ? 'Active' : 'Blocked'}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editUser('${u._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${u._id}')">
                    <i class="fas fa-trash"></i>
                </button>
             </td>
        </tr>
    `).join('');
}

// Add new mechanic
window.addMechanic = async function() {
    const result = await Swal.fire({
        title: 'Add New Mechanic',
        html: `
            <input id="mechanicName" class="swal2-input" placeholder="Full Name" required>
            <input id="mechanicEmail" class="swal2-input" placeholder="Email" type="email" required>
            <input id="mechanicPhone" class="swal2-input" placeholder="Phone" required>
            <input id="mechanicSpecialization" class="swal2-input" placeholder="Specialization">
            <input id="mechanicExperience" class="swal2-input" placeholder="Experience (years)" type="number">
            <input id="mechanicPassword" class="swal2-input" placeholder="Password" type="password" required>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add Mechanic',
        preConfirm: () => {
            return {
                name: document.getElementById('mechanicName').value,
                email: document.getElementById('mechanicEmail').value,
                phone: document.getElementById('mechanicPhone').value,
                specialization: document.getElementById('mechanicSpecialization').value,
                experience: parseInt(document.getElementById('mechanicExperience').value) || 0,
                password: document.getElementById('mechanicPassword').value
            };
        }
    });
    
    if (result.isConfirmed && result.value) {
        const data = { ...result.value, role: 'mechanic' };
        const response = await fetchAPI('/api/auth/register', 'POST', data);
        
        if (response.success) {
            Swal.fire('Added!', 'Mechanic added successfully', 'success');
            loadMechanics();
        } else {
            Swal.fire('Error', response.message, 'error');
        }
    }
};

// Edit user
window.editUser = async function(userId) {
    // Fetch user details
    const response = await fetchAPI(`/api/admin/user/${userId}`);
    
    if (response.success && response.user) {
        const u = response.user;
        const result = await Swal.fire({
            title: 'Edit User',
            html: `
                <input id="userName" class="swal2-input" placeholder="Name" value="${u.name || ''}">
                <input id="userEmail" class="swal2-input" placeholder="Email" value="${u.email || ''}">
                <input id="userPhone" class="swal2-input" placeholder="Phone" value="${u.phone || ''}">
                <select id="userStatus" class="swal2-select">
                    <option value="active" ${u.isActive ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${!u.isActive ? 'selected' : ''}>Inactive</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            preConfirm: () => {
                return {
                    name: document.getElementById('userName').value,
                    email: document.getElementById('userEmail').value,
                    phone: document.getElementById('userPhone').value,
                    isActive: document.getElementById('userStatus').value === 'active'
                };
            }
        });
        
        if (result.isConfirmed && result.value) {
            const updateResponse = await fetchAPI(`/api/admin/user/${userId}`, 'PUT', result.value);
            if (updateResponse.success) {
                Swal.fire('Updated!', 'User updated successfully', 'success');
                loadUsers();
            } else {
                Swal.fire('Error', updateResponse.message, 'error');
            }
        }
    }
};

// Delete user
window.deleteUser = async function(userId) {
    const result = await Swal.fire({
        title: 'Delete User?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Yes, Delete'
    });
    
    if (result.isConfirmed) {
        const response = await fetchAPI(`/api/admin/user/${userId}`, 'DELETE');
        if (response.success) {
            Swal.fire('Deleted!', 'User has been deleted', 'success');
            loadUsers();
        } else {
            Swal.fire('Error', response.message, 'error');
        }
    }
};

// View customer details
window.viewCustomerDetails = async function(userId) {
    const response = await fetchAPI(`/api/admin/user/${userId}`);
    
    if (response.success && response.user) {
        const u = response.user;
        Swal.fire({
            title: 'Customer Details',
            html: `
                <div class="text-start">
                    <p><strong>Name:</strong> ${u.name}</p>
                    <p><strong>Email:</strong> ${u.email}</p>
                    <p><strong>Phone:</strong> ${u.phone}</p>
                    <p><strong>Vehicle:</strong> ${u.vehicleDetails?.make || 'N/A'} ${u.vehicleDetails?.model || ''}</p>
                    <p><strong>Vehicle Number:</strong> ${u.vehicleDetails?.licensePlate || 'N/A'}</p>
                    <p><strong>Joined:</strong> ${new Date(u.createdAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${u.isActive ? 'Active' : 'Inactive'}</p>
                </div>
            `,
            icon: 'info'
        });
    }
};

// Export functions
window.loadPendingApprovals = loadPendingApprovals;
window.loadMechanics = loadMechanics;
window.loadUsers = loadUsers;
window.addMechanic = addMechanic;