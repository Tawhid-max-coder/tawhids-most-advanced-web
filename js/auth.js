/* ============================================
   TAWHID - Authentication JavaScript
   Handles login and registration
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (Storage.getCurrentUser()) {
        // If on login or register page, redirect to dashboard
        const currentPage = window.location.pathname;
        if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
            window.location.href = 'dashboard.html';
            return;
        }
    }
    
    // Initialize login form
    initLoginForm();
    
    // Initialize register form
    initRegisterForm();
    
    // Initialize OTP form
    initOTPForm();
});

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.classList.remove('fa-eye');
        button.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        button.classList.remove('fa-eye-slash');
        button.classList.add('fa-eye');
    }
}

// Make togglePassword global
window.togglePassword = togglePassword;

// Login form functionality
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Validate inputs
            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            // Attempt login
            const user = Storage.loginUser(email, password);
            
            if (user) {
                showToast('Login successful! Welcome back, ' + user.name, 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showToast('Invalid email or password', 'error');
            }
        });
    }
}

// Register form functionality
let otpTimer;

function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (!terms) {
                showToast('Please accept the terms and conditions', 'error');
                return;
            }
            
            // Check if user already exists
            if (Storage.userExists(email)) {
                showToast('An account with this email already exists', 'error');
                return;
            }
            
            // Generate OTP and save pending user
            const otp = Storage.generateOTP();
            const pendingUser = { name, email, password };
            
            Storage.saveRegisterOTP(otp, pendingUser);
            
            // Show OTP form
            showOTPForm(otp);
        });
    }
}

// OTP form functionality
function initOTPForm() {
    const otpForm = document.getElementById('otpForm');
    const resendBtn = document.getElementById('resendOtp');
    
    if (otpForm) {
        otpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const enteredOtp = document.getElementById('otp').value.trim();
            const storedOtp = Storage.getRegisterOTP();
            
            // Check if OTP is expired
            if (Storage.isOTPExpired()) {
                showToast('OTP has expired. Please resend.', 'error');
                return;
            }
            
            // Verify OTP
            if (enteredOtp !== storedOtp) {
                showToast('Invalid OTP. Please try again.', 'error');
                return;
            }
            
            // OTP verified - Complete registration
            completeRegistration();
        });
    }
    
    if (resendBtn) {
        resendBtn.addEventListener('click', function() {
            const pendingUser = Storage.getPendingUser();
            
            if (pendingUser) {
                const newOtp = Storage.generateOTP();
                Storage.saveRegisterOTP(newOtp, pendingUser);
                
                // Display new OTP
                document.getElementById('displayOtp').textContent = newOtp;
                
                // Restart timer
                startOTPTimer();
                
                showToast('New OTP generated successfully!', 'success');
            } else {
                showToast('Session expired. Please start registration again.', 'error');
                showRegisterForm();
            }
        });
    }
}

// Show OTP form
function showOTPForm(otp) {
    const registerForm = document.getElementById('registerForm');
    const otpForm = document.getElementById('otpForm');
    
    if (registerForm && otpForm) {
        registerForm.style.display = 'none';
        otpForm.style.display = 'block';
        
        // Display OTP (for demo purposes)
        document.getElementById('displayOtp').textContent = otp;
        
        // Start timer
        startOTPTimer();
        
        showToast('OTP generated! Check the demo message above.', 'success');
    }
}

// Show register form
function showRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const otpForm = document.getElementById('otpForm');
    
    if (registerForm && otpForm) {
        otpForm.style.display = 'none';
        registerForm.style.display = 'block';
        
        // Clear timer
        clearInterval(otpTimer);
        
        // Clear OTP data
        Storage.clearRegisterData();
    }
}

// Make showRegisterForm global
window.showRegisterForm = showRegisterForm;

// Start OTP timer
function startOTPTimer() {
    let seconds = 60;
    const timerDisplay = document.getElementById('timerDisplay');
    const resendBtn = document.getElementById('resendOtp');
    
    // Clear existing timer
    clearInterval(otpTimer);
    
    // Disable resend button
    if (resendBtn) {
        resendBtn.disabled = true;
    }
    
    otpTimer = setInterval(() => {
        seconds--;
        
        if (timerDisplay) {
            timerDisplay.textContent = seconds;
        }
        
        if (seconds <= 0) {
            clearInterval(otpTimer);
            if (resendBtn) {
                resendBtn.disabled = false;
            }
            if (timerDisplay) {
                timerDisplay.textContent = '0';
            }
        }
    }, 1000);
}

// Complete registration
function completeRegistration() {
    const pendingUser = Storage.getPendingUser();
    
    if (pendingUser) {
        // Register the user
        const newUser = Storage.registerUser(pendingUser);
        
        // Clear registration data
        Storage.clearRegisterData();
        clearInterval(otpTimer);
        
        showToast('Registration successful! Welcome to TAWHID, ' + newUser.name, 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        showToast('Session expired. Please start registration again.', 'error');
        showRegisterForm();
    }
}

// Email validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        const icon = toast.querySelector('i');
        
        toastMessage.textContent = message;
        toast.className = 'toast show ' + type;
        
        if (icon) {
            icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
