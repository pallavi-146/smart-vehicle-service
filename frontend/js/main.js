// Main JavaScript file for common functions

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// API request helper
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(endpoint, options);
    return await response.json();
}

// Show notification
function showNotification(title, message, type = 'info') {
    // You can implement toast notifications here
    console.log(`${type}: ${title} - ${message}`);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Generate random ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Validate email
function validateEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

// Validate phone number
function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load component
async function loadComponent(componentName, elementId) {
    try {
        const response = await fetch(`/components/${componentName}.html`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${componentName}:`, error);
    }
}

// Initialize page based on role
function initPage() {
    const user = getCurrentUser();
    if (!user && !window.location.pathname.includes('login') && !window.location.pathname.includes('register') && window.location.pathname !== '/') {
        window.location.href = '/login';
    }
}

// Run init when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    // Don't redirect on landing page, login, or register
    const publicPages = ['/', '/login', '/register'];
    if (!publicPages.includes(window.location.pathname)) {
        initPage();
    }
});