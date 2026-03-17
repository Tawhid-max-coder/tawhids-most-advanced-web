/* ============================================
   TAWHID - Plans JavaScript
   Handles plan purchase functionality
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
    
    // Load plans data
    loadPlansData(currentUser);
    
    // Initialize buy plan buttons
    initBuyButtons();
    
    // Initialize modal
    initModal();
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

// Load plans data
function loadPlansData(user) {
    // Update top bar user name
    const topUserName = document.getElementById('topUserName');
    if (topUserName) {
        topUserName.textContent = user.name;
    }
    
    // Update current plan name
    const currentPlanName = document.getElementById('currentPlanName');
    if (currentPlanName) {
        currentPlanName.textContent = user.plan || 'No Plan';
    }
    
    // Update balance
    const userBalance = document.getElementById('userBalance');
    if (userBalance) {
        userBalance.textContent = formatNumber(user.balance || 0);
    }
    
    // Update buy buttons based on current plan
    updateBuyButtons(user);
}

// Update buy buttons
function updateBuyButtons(user) {
    const buyButtons = document.querySelectorAll('.buy-plan-btn');
    
    buyButtons.forEach(button => {
        const planName = button.getAttribute('data-plan');
        
        if (user.plan === planName) {
            button.textContent = 'Current Plan';
            button.disabled = true;
            button.classList.add('btn-disabled');
            button.classList.remove('btn-primary', 'btn-outline');
        }
    });
}

// Selected plan for purchase
let selectedPlan = null;
let selectedPrice = 0;

// Initialize buy buttons
function initBuyButtons() {
    const buyButtons = document.querySelectorAll('.buy-plan-btn');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.disabled) return;
            
            const planName = this.getAttribute('data-plan');
            const planPrice = parseInt(this.getAttribute('data-price'));
            
            selectedPlan = planName;
            selectedPrice = planPrice;
            
            showConfirmModal(planName, planPrice);
        });
    });
}

// Show confirmation modal
function showConfirmModal(planName, planPrice) {
    const modal = document.getElementById('confirmModal');
    const currentUser = Storage.getCurrentUser();
    const userBalance = currentUser.balance || 0;
    const remainingBalance = userBalance - planPrice;
    
    // Update modal content
    document.getElementById('confirmPlanName').textContent = planName + ' Plan';
    document.getElementById('confirmPlanPrice').textContent = formatNumber(planPrice);
    document.getElementById('confirmCurrentBalance').textContent = formatNumber(userBalance);
    document.getElementById('confirmDeduction').textContent = formatNumber(planPrice);
    document.getElementById('confirmRemainingBalance').textContent = formatNumber(Math.max(0, remainingBalance));
    
    // Update icon based on plan
    const confirmIcon = document.querySelector('.confirm-plan-icon i');
    if (confirmIcon) {
        if (planName === 'Noob') {
            confirmIcon.className = 'fas fa-seedling';
        } else if (planName === 'Normal') {
            confirmIcon.className = 'fas fa-star';
        } else {
            confirmIcon.className = 'fas fa-crown';
        }
    }
    
    // Check if user has enough balance
    const confirmBtn = document.getElementById('confirmPurchase');
    if (userBalance < planPrice) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-times"></i> Insufficient Balance';
        confirmBtn.classList.add('btn-disabled');
        document.getElementById('confirmRemainingBalance').style.color = 'var(--danger)';
    } else {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm Purchase';
        confirmBtn.classList.remove('btn-disabled');
        document.getElementById('confirmRemainingBalance').style.color = '';
    }
    
    // Show modal
    modal.classList.add('show');
}

// Initialize modal
function initModal() {
    const modal = document.getElementById('confirmModal');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelPurchase');
    const confirmBtn = document.getElementById('confirmPurchase');
    const overlay = modal.querySelector('.modal-overlay');
    
    // Close modal functions
    function closeModal() {
        modal.classList.remove('show');
        selectedPlan = null;
        selectedPrice = 0;
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    // Confirm purchase
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (this.disabled) return;
            
            processPurchase();
        });
    }
}

// Process purchase
function processPurchase() {
    if (!selectedPlan || !selectedPrice) {
        showToast('Invalid plan selection', 'error');
        return;
    }
    
    const currentUser = Storage.getCurrentUser();
    
    // Check balance
    if (currentUser.balance < selectedPrice) {
        showToast('Insufficient balance. Please add funds to your wallet.', 'error');
        closeModal();
        return;
    }
    
    // Process purchase
    const result = Storage.purchasePlan(currentUser.email, selectedPlan, selectedPrice);
    
    if (result.success) {
        showToast('Congratulations! You have purchased the ' + selectedPlan + ' plan!', 'success');
        
        // Close modal
        document.getElementById('confirmModal').classList.remove('show');
        
        // Reload page to update data
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } else {
        showToast(result.message || 'Failed to process purchase', 'error');
    }
}

// Close modal helper
function closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');
    selectedPlan = null;
    selectedPrice = 0;
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
