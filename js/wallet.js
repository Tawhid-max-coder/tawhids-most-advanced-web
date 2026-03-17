/* ============================================
   TAWHID - Wallet JavaScript
   Handles wallet functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Protect page - redirect if not logged in
    if (!Storage.protectPage()) {
        return;
    }
    
    // Get current user
    const currentUser = Storage.getCurrentUser();
    
    // Initialize sidebar
    initSidebar();
    
    // Load wallet data
    loadWalletData(currentUser);
});

// Sidebar functionality
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Storage.logout();
            showToast('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992) {
            if (sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Load wallet data
function loadWalletData(user) {
    // Update top bar user name
    const topUserName = document.getElementById('topUserName');
    if (topUserName) {
        topUserName.textContent = user.name;
    }
    
    // Update current balance
    const currentBalance = document.getElementById('currentBalance');
    if (currentBalance) {
        currentBalance.textContent = formatNumber(user.balance || 0);
    }
}

// Helper functions
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}

// Toast notification
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
