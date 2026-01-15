// Main JavaScript - Global functions

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = this.querySelector('i');
        
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Contact form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Show success message
        alert('Xabaringiz yuborildi! Tez orada siz bilan bog\'lanamiz.');
        this.reset();
    });
}

// User menu dropdown
const userBtn = document.getElementById('userBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

if (userBtn && dropdownMenu) {
    userBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('active');
    });
}

// Check authentication and update navbar
function updateNavbar() {
    const token = localStorage.getItem('access_token');
    const userName = localStorage.getItem('user_name');
    const userRole = localStorage.getItem('user_role');
    
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userNameSpan = document.getElementById('userName');
    const dashboardLink = document.getElementById('dashboardLink');
    
    if (token && userName) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userNameSpan) userNameSpan.textContent = userName;
        
        // Set dashboard link based on role
        if (dashboardLink) {
            if (userRole === 'STUDENT') {
                dashboardLink.href = '/student/';
            } else if (userRole === 'TEACHER') {
                dashboardLink.href = '/teacher/';
            } else {
                dashboardLink.href = '/admin/';
            }
        }
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Logout function
function logout() {
    if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
        localStorage.clear();
        window.location.href = '/';
    }
}

// Format date to Uzbek locale
function formatDate(date) {
    return new Date(date).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format datetime to Uzbek locale
function formatDateTime(date) {
    return new Date(date).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calculate time remaining
function getTimeRemaining(deadline) {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    
    if (diff <= 0) {
        return 'Muddat o\'tgan';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days} kun ${hours} soat`;
    } else if (hours > 0) {
        return `${hours} soat`;
    } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes} daqiqa`;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Debounce function for search inputs
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
    
    // Add animation to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10000;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #10B981;
        color: #10B981;
    }
    
    .notification-error {
        border-left: 4px solid #EF4444;
        color: #EF4444;
    }
    
    .notification-info {
        border-left: 4px solid #4F46E5;
        color: #4F46E5;
    }
    
    .notification i {
        font-size: 1.3rem;
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Mobile menu styles */
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
        }
        
        .nav-link {
            padding: 1rem;
            border-bottom: 1px solid #f3f4f6;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on login page
    if (window.location.pathname.includes('/login')) {
        initLoginPage();
    }
});

function initLoginPage() {
    const loginForm = document.querySelector('form');
    const phoneInput = document.querySelector('input[name="phone"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginButton = document.querySelector('button[type="submit"]');
    const forgotLink = document.querySelector('a[href*="forgot"]');

    if (!loginForm) return;

    // Phone formatting
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Prevent default on forgot password link
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/forgot-password/';
        });
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();

        // Validation
        if (!phone || !password) {
            alert('Iltimos, barcha maydonlarni to\'ldiring');
            return;
        }

        // Format phone
        const formattedPhone = phone.startsWith('998') ? phone : '998' + phone;

        // Disable button
        loginButton.disabled = true;
        loginButton.textContent = 'Yuklanmoqda...';

        try {
            const result = await window.auth.login(formattedPhone, password);
            window.auth.redirectToDashboard();
        } catch (error) {
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Kirish';
            
            alert(error.message || 'Kirish amalga oshmadi');
            passwordInput.value = '';
        }
    });
}