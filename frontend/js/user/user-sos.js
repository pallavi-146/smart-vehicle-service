// User SOS JavaScript
// Handles emergency SOS functionality

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Check authentication
if (!token) {
    window.location.href = '/login';
}

// DOM Elements
let sosBtn, sosModal, confirmSosBtn;
let currentLocation = null;

// Initialize SOS functionality
document.addEventListener('DOMContentLoaded', () => {
    sosBtn = document.getElementById('sosBtn');
    
    if (sosBtn) {
        sosBtn.addEventListener('click', initiateSOS);
    }
    
    // Request location permission on page load
    requestLocationPermission();
});

// Request location permission
function requestLocationPermission() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('Location obtained:', currentLocation);
            },
            (error) => {
                console.error('Location error:', error);
                // Show warning but don't block SOS
                if (error.code === 1) {
                    showToast('Please enable location access for SOS feature', 'warning');
                }
            }
        );
    }
}

// Initiate SOS
async function initiateSOS() {
    // First, show confirmation dialog
    const result = await Swal.fire({
        title: '🚨 EMERGENCY SOS',
        html: `
            <div class="text-center">
                <i class="fas fa-ambulance fa-4x text-danger mb-3"></i>
                <p>Are you in an emergency situation?</p>
                <p class="text-muted small">This will send an immediate alert to our admin team with your location.</p>
                <p class="text-danger fw-bold">Only use in real emergencies!</p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '🚨 SEND SOS',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc3545'
    });
    
    if (result.isConfirmed) {
        // Get fresh location
        await getCurrentLocation();
        
        // Show loading
        Swal.fire({
            title: 'Sending SOS Alert...',
            text: 'Please wait while we notify the admin team',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Get active booking if any
        let activeBookingId = null;
        try {
            const bookingsResponse = await fetchAPI('/api/user/bookings');
            if (bookingsResponse.success && bookingsResponse.bookings) {
                const activeBooking = bookingsResponse.bookings.find(b => 
                    b.status === 'pending' || b.status === 'approved' || b.status === 'in-progress'
                );
                if (activeBooking) {
                    activeBookingId = activeBooking._id;
                }
            }
        } catch (error) {
            console.error('Error fetching active booking:', error);
        }
        
        // Send SOS to backend
        const sosData = {
            userId: user.id,
            location: currentLocation || { lat: 28.6139, lng: 77.2090 }, // Default to Delhi if no location
            bookingId: activeBookingId,
            userName: user.name,
            userPhone: user.phone,
            timestamp: new Date().toISOString()
        };
        
        try {
            const response = await fetch('/api/sos/emergency', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sosData)
            });
            
            const data = await response.json();
            
            Swal.close();
            
            if (data.success) {
                // Show success with detailed info
                await Swal.fire({
                    title: '🚨 SOS Alert Sent!',
                    html: `
                        <div class="text-center">
                            <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                            <p>Help is on the way!</p>
                            <p class="text-muted small">Our admin team has been notified and will contact you shortly.</p>
                            <hr>
                            <p><strong>Your Location:</strong></p>
                            <p class="small">Lat: ${currentLocation?.lat || 'Unknown'}<br>Lng: ${currentLocation?.lng || 'Unknown'}</p>
                            <p class="text-warning small">Please stay at your vehicle and keep your phone nearby.</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745'
                });
                
                // Play sound effect
                playSOSBeep();
                
                // Optionally, open maps
                if (currentLocation) {
                    const result = await Swal.fire({
                        title: 'Open Maps?',
                        text: 'Would you like to see your location on maps?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Open Maps'
                    });
                    
                    if (result.isConfirmed) {
                        window.open(`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`, '_blank');
                    }
                }
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'Failed to send SOS alert. Please call emergency services.',
                    icon: 'error',
                    confirmButtonText: 'Call Emergency',
                    showCancelButton: true,
                    cancelButtonText: 'Close'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'tel:100'; // Police emergency
                    }
                });
            }
        } catch (error) {
            Swal.close();
            console.error('SOS Error:', error);
            
            // Fallback - show emergency numbers
            Swal.fire({
                title: 'Connection Error',
                html: `
                    <p>Unable to send SOS alert.</p>
                    <p>Please call emergency services immediately:</p>
                    <div class="text-start mt-3">
                        <p><strong>Police:</strong> 100</p>
                        <p><strong>Ambulance:</strong> 102</p>
                        <p><strong>Roadside Assistance:</strong> 1033</p>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Call Police',
                showCancelButton: true,
                cancelButtonText: 'Close'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'tel:100';
                }
            });
        }
    }
}

// Get current location
function getCurrentLocation() {
    return new Promise((resolve) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(currentLocation);
                },
                (error) => {
                    console.error('Location error:', error);
                    // Use default location if can't get current
                    currentLocation = { lat: 28.6139, lng: 77.2090 };
                    resolve(currentLocation);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            currentLocation = { lat: 28.6139, lng: 77.2090 };
            resolve(currentLocation);
        }
    });
}

// Play SOS beep sound
function playSOSBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Play beep pattern
        const beep = (frequency, duration) => {
            return new Promise((resolve) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                gainNode.gain.value = 0.3;
                
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    resolve();
                }, duration);
            });
        };
        
        // Play SOS pattern: 3 short, 3 long, 3 short
        (async () => {
            for (let i = 0; i < 3; i++) {
                await beep(880, 200);
                await new Promise(r => setTimeout(r, 100));
            }
            for (let i = 0; i < 3; i++) {
                await beep(880, 600);
                await new Promise(r => setTimeout(r, 100));
            }
            for (let i = 0; i < 3; i++) {
                await beep(880, 200);
                await new Promise(r => setTimeout(r, 100));
            }
        })();
    } catch (error) {
        console.log('Audio not supported');
    }
}

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

// Show toast message
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    setTimeout(() => toast.remove(), 5000);
}

// Check if user has active emergency contact
async function getEmergencyContact() {
    try {
        const response = await fetchAPI('/api/user/profile');
        if (response.success && response.user) {
            return {
                name: response.user.emergencyContactName || null,
                phone: response.user.emergencyContactPhone || null
            };
        }
    } catch (error) {
        console.error('Error fetching emergency contact:', error);
    }
    return { name: null, phone: null };
}

// Share location via WhatsApp (optional feature)
function shareLocationViaWhatsApp() {
    if (currentLocation) {
        const message = `🚨 EMERGENCY! I need roadside assistance.\nLocation: https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
}

// Send SMS directly (fallback)
function sendDirectSMS() {
    if (currentLocation && user.phone) {
        const message = `SOS: Need roadside assistance at https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;
        window.location.href = `sms:100?body=${encodeURIComponent(message)}`;
    }
}

// Export functions for global use
window.initiateSOS = initiateSOS;
window.getCurrentLocation = getCurrentLocation;
window.shareLocationViaWhatsApp = shareLocationViaWhatsApp;
window.sendDirectSMS = sendDirectSMS;

// Add keyboard shortcut for SOS (Ctrl + Shift + S)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        initiateSOS();
    }
});

// Show SOS button animation on page load
if (sosBtn) {
    sosBtn.classList.add('animate__animated', 'animate__pulse');
    setInterval(() => {
        if (sosBtn) {
            sosBtn.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                sosBtn.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        }
    }, 10000);
}