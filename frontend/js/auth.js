// Authentication handling

// Login function
async function login(email, password, role) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Register function
async function register(userData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Get token
function getToken() {
    return localStorage.getItem('token');
}

// Check if authenticated
function isAuthenticated() {
    return !!getToken();
}

// Get user role
function getUserRole() {
    const user = localStorage.getItem('user');
    if (user) {
        return JSON.parse(user).role;
    }
    return null;
}

// Redirect based on role
function redirectToDashboard() {
    const role = getUserRole();
    if (role === 'user') {
        window.location.href = '/user-dashboard';
    } else if (role === 'mechanic') {
        window.location.href = '/mechanic-dashboard';
    } else if (role === 'admin') {
        window.location.href = '/admin-dashboard';
    } else {
        window.location.href = '/login';
    }
}

// Auto logout on token expiry
setInterval(() => {
    const token = getToken();
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                logout();
            }
        } catch (e) {
            console.error('Invalid token');
        }
    }
}, 60000); // Check every minute