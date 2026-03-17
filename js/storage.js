/* ============================================
   TAWHID - Storage Helper Functions
   Handles all localStorage operations
   ============================================ */

const Storage = {
    // Get all users from localStorage
    getUsers: function() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    },

    // Save users to localStorage
    saveUsers: function(users) {
        localStorage.setItem('users', JSON.stringify(users));
    },

    // Get current logged in user
    getCurrentUser: function() {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
    },

    // Save current user session
    saveCurrentUser: function(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Get all transactions
    getTransactions: function() {
        const transactions = localStorage.getItem('transactions');
        return transactions ? JSON.parse(transactions) : [];
    },

    // Save transactions
    saveTransactions: function(transactions) {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    },

    // Add a new transaction
    addTransaction: function(transaction) {
        const transactions = this.getTransactions();
        transactions.push(transaction);
        this.saveTransactions(transactions);
    },

    // Get user transactions
    getUserTransactions: function(email) {
        const transactions = this.getTransactions();
        return transactions.filter(t => t.userEmail === email);
    },

    // Check if user exists
    userExists: function(email) {
        const users = this.getUsers();
        return users.some(u => u.email.toLowerCase() === email.toLowerCase());
    },

    // Register new user
    registerUser: function(userData) {
        const users = this.getUsers();
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password,
            balance: 0,
            plan: null,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    },

    // Login user
    loginUser: function(email, password) {
        const users = this.getUsers();
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );
        if (user) {
            this.saveCurrentUser(user);
            return user;
        }
        return null;
    },

    // Logout user
    logout: function() {
        localStorage.removeItem('currentUser');
    },

    // Update user data
    updateUser: function(email, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.saveUsers(users);
            
            // Update current user if it's the same user
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
                this.saveCurrentUser(users[index]);
            }
            return users[index];
        }
        return null;
    },

    // Add balance to user
    addBalance: function(email, amount) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (index !== -1) {
            users[index].balance = (users[index].balance || 0) + amount;
            this.saveUsers(users);
            
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
                this.saveCurrentUser(users[index]);
            }
            return users[index];
        }
        return null;
    },

    // Deduct balance from user
    deductBalance: function(email, amount) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (index !== -1 && users[index].balance >= amount) {
            users[index].balance -= amount;
            this.saveUsers(users);
            
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
                this.saveCurrentUser(users[index]);
            }
            return users[index];
        }
        return null;
    },

    // Purchase plan
    purchasePlan: function(email, planName, price) {
        const user = this.getCurrentUser();
        if (!user || user.balance < price) {
            return { success: false, message: 'Insufficient balance' };
        }

        // Deduct balance and set plan
        const updatedUser = this.deductBalance(email, price);
        if (updatedUser) {
            this.updateUser(email, { plan: planName });
            
            // Add transaction
            this.addTransaction({
                id: Date.now(),
                userEmail: email,
                type: 'purchase',
                method: 'Plan Purchase',
                amount: price,
                description: `Purchased ${planName} Plan`,
                date: new Date().toISOString()
            });

            return { success: true, user: this.getCurrentUser() };
        }
        return { success: false, message: 'Failed to process purchase' };
    },

    // Generate OTP
    generateOTP: function() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    // Save registration OTP
    saveRegisterOTP: function(otp, pendingUser) {
        localStorage.setItem('registerOTP', otp);
        localStorage.setItem('pendingUser', JSON.stringify(pendingUser));
        localStorage.setItem('otpExpiry', (Date.now() + 60000).toString());
    },

    // Get registration OTP
    getRegisterOTP: function() {
        return localStorage.getItem('registerOTP');
    },

    // Get pending user
    getPendingUser: function() {
        const pendingUser = localStorage.getItem('pendingUser');
        return pendingUser ? JSON.parse(pendingUser) : null;
    },

    // Check OTP expiry
    isOTPExpired: function() {
        const expiry = localStorage.getItem('otpExpiry');
        return !expiry || Date.now() > parseInt(expiry);
    },

    // Clear registration data
    clearRegisterData: function() {
        localStorage.removeItem('registerOTP');
        localStorage.removeItem('pendingUser');
        localStorage.removeItem('otpExpiry');
    },

    // Save payment OTP
    savePaymentOTP: function(otp, pendingDeposit) {
        localStorage.setItem('paymentOTP', otp);
        localStorage.setItem('pendingDeposit', JSON.stringify(pendingDeposit));
        localStorage.setItem('otpExpiry', (Date.now() + 60000).toString());
    },

    // Get payment OTP
    getPaymentOTP: function() {
        return localStorage.getItem('paymentOTP');
    },

    // Get pending deposit
    getPendingDeposit: function() {
        const pendingDeposit = localStorage.getItem('pendingDeposit');
        return pendingDeposit ? JSON.parse(pendingDeposit) : null;
    },

    // Clear payment data
    clearPaymentData: function() {
        localStorage.removeItem('paymentOTP');
        localStorage.removeItem('pendingDeposit');
        localStorage.removeItem('otpExpiry');
    },

    // Check if user is authenticated
    isAuthenticated: function() {
        return this.getCurrentUser() !== null;
    },

    // Protect page - redirect to login if not authenticated
    protectPage: function() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
