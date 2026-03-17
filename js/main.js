/* ============================================
   TAWHID - Main JavaScript File
   Handles homepage functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Update auth buttons based on login status
    updateAuthButtons();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Initialize animations
    initAnimations();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
        }
    });
}

// Update authentication buttons based on login status
function updateAuthButtons() {
    const navAuth = document.getElementById('navAuth');
    const currentUser = Storage.getCurrentUser();
    
    if (navAuth) {
        if (currentUser) {
            navAuth.innerHTML = `
                <a href="dashboard.html" class="btn btn-outline">
                    <i class="fas fa-th-large"></i> Dashboard
                </a>
                <a href="#" class="btn btn-primary" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
            
            // Add logout functionality
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    Storage.logout();
                    showToast('Logged out successfully!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                });
            }
        }
    }
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            showToast('Thank you for contacting TAWHID! We will get back to you soon.', 'success');
            contactForm.reset();
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
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
}

// Initialize scroll animations
function initAnimations() {
    // Add fade-in animation to elements when they come into view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animateElements = document.querySelectorAll('.feature-card, .plan-card, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add animation class
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);

// Toast notification function
function showToast(message, type = 'success') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span id="toastMessage">Message</span>
            </div>
        `;
        document.body.appendChild(toast);
    }
    
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    if (toastMessage) {
        toastMessage.textContent = message;
    }
    
    toast.className = 'toast show ' + type;
    
    if (icon) {
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Export showToast for global use
window.showToast = showToast;
