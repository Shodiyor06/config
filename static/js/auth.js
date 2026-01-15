// Authentication JavaScript

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('access_token');
}

// Get current user role
function getUserRole() {
    return localStorage.getItem('user_role');
}

// Get current user info
function getCurrentUser() {
    return {
        name: localStorage.getItem('user_name'),
        role: localStorage.getItem('user_role'),
        id: localStorage.getItem('user_id')
    };
}

// Redirect based on role
function redirectToDashboard() {
    const role = getUserRole();
    
    if (role === 'STUDENT') {
        window.location.href = '/student/';
    } else if (role === 'TEACHER') {
        window.location.href = '/teacher/';
    } else if (role === 'ADMIN') {
        window.location.href = '/admin/';
    } else {
        window.location.href = '/';
    }
}

// Protect pages that require authentication
function requireAuth(requiredRole = null) {
    if (!isAuthenticated()) {
        window.location.href = '/login/';
        return false;
    }
    
    if (requiredRole && getUserRole() !== requiredRole) {
        // Redirect to appropriate dashboard
        redirectToDashboard();
        return false;
    }
    
    return true;
}

// API request helper with authentication
async function authenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        
        // Handle unauthorized (token expired)
        if (response.status === 401) {
            // Try to refresh token
            const refreshed = await refreshAccessToken();
            
            if (refreshed) {
                // Retry original request with new token
                config.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
                return await fetch(url, config);
            } else {
                // Refresh failed, logout user
                handleLogout();
                return null;
            }
        }
        
        return response;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

// Refresh access token
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
        return false;
    }
    
    try {
        const response = await fetch('/api/auth/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

// Handle logout
function handleLogout() {
    // Clear all stored data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    
    // Redirect to home
    window.location.href = '/';
}

// Login function
async function login(phone, password) {
    try {
        const response = await fetch('/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phone,
                password: password
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        
        const data = await response.json();
        
        // Store tokens and user info
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_name', data.name);
        localStorage.setItem('user_id', data.user_id);
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Format phone number
function formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('998') && cleaned.length === 9) {
        return '998' + cleaned;
    }
    
    return cleaned;
}

// Validate phone number
function isValidPhone(phone) {
    const cleaned = formatPhoneNumber(phone);
    
    // Uzbekistan phone number format: 998XXXXXXXXX (12 digits)
    return cleaned.length === 12 && cleaned.startsWith('998');
}

// Validate password
function isValidPassword(password) {
    // At least 6 characters
    return password.length >= 6;
}

// Auto-logout on token expiration
let tokenCheckInterval;

function startTokenCheck() {
    // Check token validity every 5 minutes
    tokenCheckInterval = setInterval(async () => {
        if (isAuthenticated()) {
            const isValid = await checkTokenValidity();
            if (!isValid) {
                handleLogout();
            }
        }
    }, 5 * 60 * 1000); // 5 minutes
}

async function checkTokenValidity() {
    try {
        const response = await authenticatedRequest('/api/auth/verify/');
        return response && response.ok;
    } catch (error) {
        return false;
    }
}

function stopTokenCheck() {
    if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
    }
}

// Initialize authentication checking
if (isAuthenticated()) {
    startTokenCheck();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopTokenCheck();
});

// Export functions for use in other scripts
window.auth = {
    isAuthenticated,
    getUserRole,
    getCurrentUser,
    redirectToDashboard,
    requireAuth,
    authenticatedRequest,
    login,
    handleLogout,
    formatPhoneNumber,
    isValidPhone,
    isValidPassword
};

// Page-specific initialization
document.addEventListener('DOMContentLoaded', function() {
    // If on login page and already authenticated, redirect
    if (window.location.pathname === '/login/' && isAuthenticated()) {
        redirectToDashboard();
    }
    
    // If on protected page and not authenticated, redirect to login
    const protectedPaths = ['/student/', '/teacher/', '/admin/'];
    const currentPath = window.location.pathname;
    
    if (protectedPaths.some(path => currentPath.startsWith(path))) {
        if (!isAuthenticated()) {
            window.location.href = '/login/';
        } else {
            // Check if user has correct role for this page
            const role = getUserRole();
            
            if (currentPath.startsWith('/student/') && role !== 'STUDENT') {
                redirectToDashboard();
            } else if (currentPath.startsWith('/teacher/') && role !== 'TEACHER') {
                redirectToDashboard();
            } else if (currentPath.startsWith('/admin/') && role !== 'ADMIN') {
                redirectToDashboard();
            }
        }
    }
});
// document.getElementById('loginForm').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const phone = document.getElementById('phone').value;
//     const password = document.getElementById('password').value;

//     const errorMessage = document.getElementById('errorMessage');
//     const errorText = document.getElementById('errorText');

//     try {
//         const response = await fetch('/login/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ phone, password })
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             errorText.textContent = data.error || 'Login yoki parol noto‘g‘ri';
//             errorMessage.style.display = 'flex';
//             return;
//         }

//         // ✅ muvaffaqiyatli login
//         errorMessage.style.display = 'none';

//         localStorage.setItem('access_token', data.access);
//         localStorage.setItem('user_role', data.role);
//         localStorage.setItem('user_name', data.name);

//         // redirect
//         if (data.role === 'TEACHER') {
//             window.location.href = '/teacher/';
//         } else if (data.role === 'STUDENT') {
//             window.location.href = '/student/';
//         } else {
//             window.location.href = '/admin/';
//         }

//     } catch (err) {
//         errorText.textContent = 'Server bilan bog‘lanishda xatolik';
//         errorMessage.style.display = 'flex';
//     }
// });

