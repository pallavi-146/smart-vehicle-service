// Socket.IO Client for Real-Time Features
// Place this file in: frontend/js/socket.js

let socket = null;
let isConnected = false;
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;

// Initialize Socket Connection
function initSocket() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id) {
        console.log('No user logged in, skipping socket connection');
        return;
    }
    
    // Connect to Socket.IO server
    socket = io('/', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
    });
    
    // Socket event handlers
    socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        isConnected = true;
        reconnectAttempts = 0;
        
        // Join user's room based on role
        const userRole = user.role || 'user';
        const userId = user.id;
        
        socket.emit('joinRoom', userId);
        
        if (userRole === 'admin') {
            socket.emit('joinAdminRoom');
            console.log('👑 Admin joined admin room');
        } else if (userRole === 'mechanic') {
            socket.emit('joinMechanicRoom', userId);
            console.log('🔧 Mechanic joined mechanic room');
        } else {
            socket.emit('joinUserRoom', userId);
            console.log('👤 User joined user room');
        }
        
        // Show connection status
        showConnectionStatus(true);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        isConnected = false;
        showConnectionStatus(false);
    });
    
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reconnectAttempts++;
        
        if (reconnectAttempts >= maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            showConnectionError();
        }
    });
    
    socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
        isConnected = true;
        showConnectionStatus(true);
        
        // Rejoin rooms
        socket.emit('joinRoom', user.id);
        if (user.role === 'admin') socket.emit('joinAdminRoom');
        else if (user.role === 'mechanic') socket.emit('joinMechanicRoom', user.id);
        else socket.emit('joinUserRoom', user.id);
    });
    
    // ============== Notification Listeners ==============
    
    // New notification received
    socket.on('newNotification', (notification) => {
        console.log('🔔 New notification:', notification);
        
        // Add to notification bell
        showNotificationBell(notification);
        
        // Show toast message
        showToastNotification(notification.title, notification.message, notification.type);
        
        // Update notification count in UI
        updateNotificationCount();
        
        // Play sound for SOS alerts
        if (notification.type === 'sos') {
            playSOSAlert();
        }
        
        // Store in localStorage for history
        saveNotificationToStorage(notification);
    });
    
    // ============== Tracking Listeners ==============
    
    // Location updates for service tracking
    socket.on('locationUpdate', (data) => {
        console.log('📍 Location update:', data);
        
        // Update map if available
        updateMechanicLocation(data);
        
        // Update ETA display
        updateETADisplay(data.estimatedArrival);
        
        // Update status badge
        updateServiceStatus(data.status);
    });
    
    // Mechanic status update
    socket.on('mechanicStatusUpdate', (data) => {
        console.log('🔧 Mechanic status update:', data);
        
        const statusElement = document.getElementById('mechanicStatus');
        if (statusElement) {
            statusElement.innerHTML = `<span class="badge ${data.isAvailable ? 'bg-success' : 'bg-danger'}">
                ${data.isAvailable ? 'Available' : 'Busy'}
            </span>`;
        }
    });
    
    // Booking status update (real-time)
    socket.on('bookingStatusUpdate', (data) => {
        console.log('📅 Booking status update:', data);
        
        const { bookingId, status, message } = data;
        
        // Update booking status in table
        updateBookingStatusInUI(bookingId, status);
        
        // Show notification
        showToastNotification('Booking Update', message || `Your booking status changed to ${status}`, 'info');
    });
    
    // Payment confirmation (real-time)
    socket.on('paymentConfirmed', (data) => {
        console.log('💳 Payment confirmed:', data);
        
        const { bookingId, amount, transactionId } = data;
        
        showToastNotification('Payment Successful', `Payment of ₹${amount} received for booking ${bookingId}`, 'success');
        
        // Update payment status in UI
        updatePaymentStatus(bookingId, 'paid');
        
        // Reload payment history if on payment page
        if (window.location.pathname.includes('payment')) {
            setTimeout(() => window.location.reload(), 2000);
        }
    });
    
    // ============== SOS Emergency Listeners ==============
    
    socket.on('sosAlert', (data) => {
        console.log('🚨 SOS ALERT RECEIVED:', data);
        
        // Show urgent alert
        showSOSAlert(data);
        
        // Play emergency sound
        playSOSAlert();
        
        // Show browser notification
        showBrowserNotification('🚨 SOS Emergency Alert!', data.message);
    });
    
    // ============== Reminder Listeners ==============
    
    socket.on('serviceReminder', (data) => {
        console.log('⏰ Service reminder:', data);
        
        showToastNotification('Service Reminder', data.message, 'warning');
        
        // Update reminder badge
        updateReminderBadge();
    });
    
    // ============== Chat/Messaging (if implemented) ==============
    
    socket.on('newMessage', (data) => {
        console.log('💬 New message:', data);
        
        showToastNotification(data.from, data.message, 'info');
        
        // Update chat UI if open
        updateChatUI(data);
    });
}

// ============== Helper Functions ==============

// Show connection status in UI
function showConnectionStatus(connected) {
    const statusElement = document.getElementById('socketStatus');
    if (statusElement) {
        if (connected) {
            statusElement.innerHTML = '<span class="badge bg-success"><i class="fas fa-circle"></i> Live</span>';
        } else {
            statusElement.innerHTML = '<span class="badge bg-danger"><i class="fas fa-circle"></i> Offline</span>';
        }
    }
}

// Show connection error
function showConnectionError() {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="toast show" role="alert">
            <div class="toast-header bg-danger text-white">
                <i class="fas fa-exclamation-triangle"></i>
                <strong class="me-auto">Connection Error</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                Unable to connect to real-time server. Refresh page to reconnect.
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// Show toast notification
function showToastNotification(title, message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        // Create container if not exists
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    const bgColor = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : type === 'error' ? 'bg-danger' : 'bg-primary';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle';
    
    const toastId = 'toast_' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.style.marginBottom = '10px';
    toast.innerHTML = `
        <div class="toast-header ${bgColor} text-white">
            <i class="fas ${icon} me-2"></i>
            <strong class="me-auto">${title}</strong>
            <small>Just now</small>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const toastElement = document.getElementById(toastId);
        if (toastElement) toastElement.remove();
    }, 5000);
}

// Show notification bell indicator
function showNotificationBell(notification) {
    const bell = document.getElementById('notificationBell');
    const countBadge = document.getElementById('notificationCount');
    
    if (bell) {
        bell.classList.add('animate__animated', 'animate__shake');
        setTimeout(() => bell.classList.remove('animate__animated', 'animate__shake'), 1000);
    }
    
    if (countBadge) {
        let currentCount = parseInt(countBadge.innerText) || 0;
        countBadge.innerText = currentCount + 1;
        countBadge.style.display = 'block';
    }
}

// Update notification count
async function updateNotificationCount() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/notifications/count', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const countBadge = document.getElementById('notificationCount');
        if (countBadge && data.success) {
            const count = data.count || 0;
            countBadge.innerText = count;
            countBadge.style.display = count > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error fetching notification count:', error);
    }
}

// Save notification to localStorage
function saveNotificationToStorage(notification) {
    const stored = localStorage.getItem('notifications');
    let notifications = stored ? JSON.parse(stored) : [];
    notifications.unshift({
        ...notification,
        timestamp: new Date().toISOString(),
        isRead: false
    });
    // Keep only last 50 notifications
    notifications = notifications.slice(0, 50);
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Update mechanic location on map
function updateMechanicLocation(data) {
    const mapElement = document.getElementById('mechanicMap');
    if (mapElement && data.lat && data.lng) {
        // Update map marker
        console.log(`Mechanic location: ${data.lat}, ${data.lng}`);
        
        // Update distance and ETA
        const distanceElement = document.getElementById('mechanicDistance');
        if (distanceElement) {
            const distance = calculateDistance(data.lat, data.lng);
            distanceElement.innerText = `${distance} km away`;
        }
    }
}

// Calculate distance (mock function)
function calculateDistance(lat, lng) {
    return (Math.random() * 5 + 1).toFixed(1);
}

// Update ETA display
function updateETADisplay(eta) {
    const etaElement = document.getElementById('etaDisplay');
    if (etaElement && eta) {
        etaElement.innerText = `ETA: ${eta} minutes`;
    }
}

// Update service status
function updateServiceStatus(status) {
    const statusElement = document.getElementById('serviceStatus');
    if (statusElement) {
        let badgeClass = 'bg-warning';
        let statusText = status;
        
        if (status === 'en-route') {
            badgeClass = 'bg-info';
            statusText = 'Mechanic En Route';
        } else if (status === 'arrived') {
            badgeClass = 'bg-success';
            statusText = 'Mechanic Arrived';
        } else if (status === 'in-progress') {
            badgeClass = 'bg-primary';
            statusText = 'Service In Progress';
        } else if (status === 'completed') {
            badgeClass = 'bg-success';
            statusText = 'Service Completed';
        }
        
        statusElement.innerHTML = `<span class="badge ${badgeClass}">${statusText}</span>`;
    }
}

// Update booking status in UI table
function updateBookingStatusInUI(bookingId, status) {
    const bookingRow = document.querySelector(`tr[data-booking-id="${bookingId}"]`);
    if (bookingRow) {
        const statusCell = bookingRow.querySelector('.status-cell');
        if (statusCell) {
            let badgeClass = 'bg-warning';
            if (status === 'approved') badgeClass = 'bg-info';
            else if (status === 'completed') badgeClass = 'bg-success';
            else if (status === 'cancelled') badgeClass = 'bg-danger';
            
            statusCell.innerHTML = `<span class="badge ${badgeClass}">${status}</span>`;
        }
    }
}

// Update payment status
function updatePaymentStatus(bookingId, status) {
    const paymentRow = document.querySelector(`tr[data-booking-id="${bookingId}"]`);
    if (paymentRow) {
        const paymentCell = paymentRow.querySelector('.payment-status-cell');
        if (paymentCell) {
            paymentCell.innerHTML = `<span class="badge bg-success">Paid</span>`;
        }
    }
}

// Show SOS alert (full screen for admin)
function showSOSAlert(data) {
    // Create modal for SOS alert
    const modalHtml = `
        <div class="modal fade" id="sosModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title"><i class="fas fa-ambulance"></i> 🚨 EMERGENCY SOS ALERT!</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger">
                            <strong>Customer:</strong> ${data.userName || 'Unknown'}<br>
                            <strong>Phone:</strong> ${data.userPhone || 'N/A'}<br>
                            <strong>Location:</strong> ${data.location?.lat || 'Unknown'}, ${data.location?.lng || 'Unknown'}<br>
                            <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                            <strong>Booking ID:</strong> ${data.bookingId || 'No active booking'}
                        </div>
                        <div id="sosMap" style="height: 300px; background: #e9ecef; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-map-marker-alt fa-3x text-danger"></i> Map loading...
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-success" onclick="window.location.href='tel:${data.userPhone}'">
                            <i class="fas fa-phone"></i> Call Customer
                        </button>
                        <button class="btn btn-primary" onclick="dispatchMechanic('${data.bookingId}')">
                            <i class="fas fa-truck"></i> Dispatch Mechanic
                        </button>
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Dismiss</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('sosModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('sosModal'));
    modal.show();
    
    // Play alarm sound
    playSOSAlert();
}

// Play SOS alert sound
function playSOSAlert() {
    // Create audio context for beep sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 1000);
    } catch (error) {
        console.log('Audio not supported');
    }
}

// Show browser notification
function showBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body });
            }
        });
    }
}

// Update reminder badge
function updateReminderBadge() {
    const reminderBadge = document.getElementById('reminderBadge');
    if (reminderBadge) {
        reminderBadge.style.display = 'block';
        setTimeout(() => {
            reminderBadge.style.display = 'none';
        }, 5000);
    }
}

// Update chat UI
function updateChatUI(data) {
    const chatContainer = document.getElementById('chatMessages');
    if (chatContainer) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message received mb-2';
        messageDiv.innerHTML = `
            <div class="message-bubble bg-light p-2 rounded">
                <strong>${data.from}:</strong> ${data.message}
                <small class="text-muted d-block">${new Date().toLocaleTimeString()}</small>
            </div>
        `;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// ============== Public Functions ==============

// Start tracking a service
function startTrackingService(bookingId) {
    if (socket && isConnected) {
        socket.emit('trackService', bookingId);
        console.log(`Started tracking service: ${bookingId}`);
        showToastNotification('Tracking Started', 'Real-time location tracking activated', 'info');
    } else {
        console.log('Socket not connected, cannot start tracking');
        showToastNotification('Error', 'Cannot start tracking. Please refresh the page.', 'error');
    }
}

// Stop tracking
function stopTrackingService() {
    if (socket && isConnected) {
        socket.emit('stopTracking');
        console.log('Stopped tracking');
    }
}

// Send notification to specific user
function sendNotification(to, title, message, type = 'system') {
    if (socket && isConnected) {
        socket.emit('sendNotification', { to, title, message, type });
    }
}

// Update mechanic availability
function updateMechanicAvailability(isAvailable) {
    if (socket && isConnected) {
        socket.emit('mechanicStatus', { isAvailable });
        console.log(`Mechanic availability updated: ${isAvailable}`);
    }
}

// Send location update (for mechanics)
function sendLocationUpdate(lat, lng) {
    if (socket && isConnected) {
        socket.emit('locationUpdate', { lat, lng });
    }
}

// Request location from mechanic (for admin)
function requestMechanicLocation(mechanicId) {
    if (socket && isConnected) {
        socket.emit('requestLocation', mechanicId);
    }
}

// Dispatch mechanic for SOS
function dispatchMechanic(bookingId) {
    if (socket && isConnected) {
        socket.emit('dispatchMechanic', { bookingId });
        showToastNotification('Mechanic Dispatched', 'A mechanic has been dispatched to the location', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('sosModal'));
        if (modal) modal.hide();
    }
}

// Join specific room
function joinRoom(roomName) {
    if (socket && isConnected) {
        socket.emit('joinRoom', roomName);
    }
}

// Leave specific room
function leaveRoom(roomName) {
    if (socket && isConnected) {
        socket.emit('leaveRoom', roomName);
    }
}

// Disconnect socket
function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        isConnected = false;
        console.log('Socket manually disconnected');
    }
}

// Reconnect socket
function reconnectSocket() {
    if (socket) {
        socket.connect();
    } else {
        initSocket();
    }
}

// Get connection status
function getSocketStatus() {
    return isConnected;
}

// ============== Auto-initialize on page load ==============
document.addEventListener('DOMContentLoaded', () => {
    // Don't initialize socket on landing page
    const isLandingPage = window.location.pathname === '/' || 
                          window.location.pathname === '/index.html' ||
                          window.location.pathname.includes('login') ||
                          window.location.pathname.includes('register');
    
    if (!isLandingPage && localStorage.getItem('token')) {
        // Small delay to ensure page is ready
        setTimeout(() => {
            initSocket();
        }, 1000);
    }
});

// Request notification permission on user interaction
document.addEventListener('click', () => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}, { once: true });