/* ============================================
   TAWHID - Transactions JavaScript
   Handles transaction history functionality
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
    
    // Load transactions data
    loadTransactionsData(currentUser);
    
    // Initialize filter tabs
    initFilterTabs(currentUser);
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

// Load transactions data
function loadTransactionsData(user) {
    // Update top bar user name
    const topUserName = document.getElementById('topUserName');
    if (topUserName) {
        topUserName.textContent = user.name;
    }
    
    // Get user transactions
    const transactions = Storage.getUserTransactions(user.email);
    
    // Calculate totals
    const totalDeposits = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPurchases = transactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Update summary cards
    const totalDepositsEl = document.getElementById('totalDeposits');
    if (totalDepositsEl) {
        totalDepositsEl.textContent = formatNumber(totalDeposits);
    }
    
    const totalPurchasesEl = document.getElementById('totalPurchases');
    if (totalPurchasesEl) {
        totalPurchasesEl.textContent = formatNumber(totalPurchases);
    }
    
    const currentBalance = document.getElementById('currentBalance');
    if (currentBalance) {
        currentBalance.textContent = formatNumber(user.balance || 0);
    }
    
    // Render transactions
    renderTransactions(transactions);
}

// Render transactions list
function renderTransactions(transactions, filter = 'all') {
    const transactionsList = document.getElementById('transactionsList');
    
    if (!transactionsList) return;
    
    // Filter transactions
    let filteredTransactions = transactions;
    if (filter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === filter);
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Check if there are transactions
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="no-transactions">
                <div class="no-data-icon">
                    <i class="fas fa-receipt"></i>
                </div>
                <h3>No Transactions Found</h3>
                <p>${filter === 'all' ? 'Your transaction history will appear here' : 'No ' + filter + ' transactions found'}</p>
                ${filter === 'all' ? '<a href="wallet.html" class="btn btn-primary"><i class="fas fa-wallet"></i> Add Funds</a>' : ''}
            </div>
        `;
        return;
    }
    
    // Render transactions
    transactionsList.innerHTML = filteredTransactions.map(transaction => {
        const isDeposit = transaction.type === 'deposit';
        const iconClass = isDeposit ? 'deposit' : 'purchase';
        const icon = isDeposit ? 'fa-arrow-down' : 'fa-shopping-cart';
        const amountClass = isDeposit ? 'positive' : 'negative';
        const amountPrefix = isDeposit ? '+' : '-';
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.description || transaction.method}</div>
                    <div class="transaction-date">${formatDateTime(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}৳${formatNumber(transaction.amount)}
                </div>
            </div>
        `;
    }).join('');
}

// Initialize filter tabs
function initFilterTabs(user) {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const transactions = Storage.getUserTransactions(user.email);
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            
            // Render filtered transactions
            renderTransactions(transactions, filter);
        });
    });
}

// Helper functions
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
