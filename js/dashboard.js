/* ============================================
   TAWHID - Dashboard JavaScript
   Handles dashboard functionality
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
    
    // Load user data
    loadUserData(currentUser);
    
    // Load recent transactions
    loadRecentTransactions(currentUser);
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

// Load user data
function loadUserData(user) {
    // Update welcome section
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) {
        welcomeName.textContent = user.name;
    }
    
    // Update top bar user name
    const topUserName = document.getElementById('topUserName');
    if (topUserName) {
        topUserName.textContent = user.name;
    }
    
    // Update stats
    const userBalance = document.getElementById('userBalance');
    if (userBalance) {
        userBalance.textContent = formatNumber(user.balance || 0);
    }
    
    const userPlan = document.getElementById('userPlan');
    if (userPlan) {
        userPlan.textContent = user.plan || 'None';
    }
    
    // Update transaction count
    const transactions = Storage.getUserTransactions(user.email);
    const totalTransactions = document.getElementById('totalTransactions');
    if (totalTransactions) {
        totalTransactions.textContent = transactions.length;
    }
    
    // Update account info
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = user.name;
    }
    
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = user.email;
    }
    
    const memberSince = document.getElementById('memberSince');
    if (memberSince) {
        memberSince.textContent = formatDate(user.createdAt);
    }
}

// Load recent transactions
function loadRecentTransactions(user) {
    const transactionsBody = document.getElementById('recentTransactions');
    
    if (transactionsBody) {
        const transactions = Storage.getUserTransactions(user.email);
        
        // Get last 5 transactions
        const recentTransactions = transactions.slice(-5).reverse();
        
        if (recentTransactions.length === 0) {
            transactionsBody.innerHTML = `
                <tr>
                    <td colspan="4" class="no-data">No transactions yet</td>
                </tr>
            `;
            return;
        }
        
        transactionsBody.innerHTML = recentTransactions.map(transaction => {
            const isDeposit = transaction.type === 'deposit';
            const typeIcon = isDeposit ? 'fa-arrow-down' : 'fa-shopping-cart';
            const typeColor = isDeposit ? 'color: var(--success)' : 'color: var(--secondary)';
            const amountPrefix = isDeposit ? '+' : '-';
            const amountColor = isDeposit ? 'color: var(--success)' : 'color: var(--danger)';
            
            return `
                <tr>
                    <td>
                        <span style="${typeColor}">
                            <i class="fas ${typeIcon}"></i> ${capitalizeFirst(transaction.type)}
                        </span>
                    </td>
                    <td>${transaction.description || transaction.method}</td>
                    <td style="${amountColor}; font-weight: 600;">
                        ${amountPrefix}৳${formatNumber(transaction.amount)}
                    </td>
                    <td>${formatDate(transaction.date)}</td>
                </tr>
            `;
        }).join('');
    }
}

// Helper functions
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
