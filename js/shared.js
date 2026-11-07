// ============================================
// BATTLE FF ROYALE - SHARED UTILITIES
// ============================================

const BFR = {

    // ---------- STORAGE HELPERS ----------
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    // ---------- USER MANAGEMENT ----------
    getUsers() {
        return this.get('bfr_users', []);
    },

    saveUsers(users) {
        this.set('bfr_users', users);
    },

    addUser(user) {
        const users = this.getUsers();
        user.id = 'U' + Date.now() + Math.random().toString(36).substr(2, 5);
        user.wallet = 0;
        user.status = 'active';
        user.createdAt = new Date().toISOString();
        users.push(user);
        this.saveUsers(users);
        return user;
    },

    findUser(username, password) {
        const users = this.getUsers();
        return users.find(u =>
            (u.username === username || u.email === username) &&
            u.password === password &&
            u.status === 'active'
        );
    },

    findUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    },

    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.saveUsers(users);
            return users[index];
        }
        return null;
    },

    // ---------- SESSION MANAGEMENT ----------
    getUserSession() {
        return this.get('bfr_user_session', null);
    },

    setUserSession(user) {
        this.set('bfr_user_session', {
            id: user.id,
            username: user.username,
            email: user.email,
            loggedInAt: new Date().toISOString()
        });
    },

    clearUserSession() {
        localStorage.removeItem('bfr_user_session');
    },

    getAdminSession() {
        return this.get('bfr_admin_session', null);
    },

    setAdminSession(admin) {
        this.set('bfr_admin_session', {
            username: admin.username,
            loggedInAt: new Date().toISOString()
        });
    },

    clearAdminSession() {
        localStorage.removeItem('bfr_admin_session');
    },

    // ---------- ADMIN MANAGEMENT ----------
    getAdmins() {
        let admins = this.get('bfr_admins', []);
        if (admins.length === 0) {
            admins = [{
                id: 'A001',
                username: 'admin',
                password: 'admin123',
                createdAt: new Date().toISOString()
            }];
            this.set('bfr_admins', admins);
        }
        return admins;
    },

    findAdmin(username, password) {
        const admins = this.getAdmins();
        return admins.find(a => a.username === username && a.password === password);
    },

    updateAdminPassword(username, newPassword) {
        const admins = this.getAdmins();
        const index = admins.findIndex(a => a.username === username);
        if (index !== -1) {
            admins[index].password = newPassword;
            this.set('bfr_admins', admins);
            return true;
        }
        return false;
    },

    // ---------- TOURNAMENT MANAGEMENT ----------
    getTournaments() {
        return this.get('bfr_tournaments', []);
    },

    saveTournaments(tournaments) {
        this.set('bfr_tournaments', tournaments);
    },

    addTournament(tournament) {
        const tournaments = this.getTournaments();
        tournament.id = 'T' + Date.now() + Math.random().toString(36).substr(2, 5);
        tournament.joinedPlayers = [];
        tournament.status = tournament.status || 'upcoming';
        tournament.createdAt = new Date().toISOString();
        tournaments.push(tournament);
        this.saveTournaments(tournaments);
        return tournament;
    },

    updateTournament(tournamentId, updates) {
        const tournaments = this.getTournaments();
        const index = tournaments.findIndex(t => t.id === tournamentId);
        if (index !== -1) {
            tournaments[index] = { ...tournaments[index], ...updates };
            this.saveTournaments(tournaments);
            return tournaments[index];
        }
        return null;
    },

    deleteTournament(tournamentId) {
        let tournaments = this.getTournaments();
        tournaments = tournaments.filter(t => t.id !== tournamentId);
        this.saveTournaments(tournaments);
    },

    getTournamentById(id) {
        return this.getTournaments().find(t => t.id === id);
    },

    joinTournament(tournamentId, userId) {
        const tournaments = this.getTournaments();
        const index = tournaments.findIndex(t => t.id === tournamentId);
        if (index !== -1) {
            const t = tournaments[index];
            if (!t.joinedPlayers) t.joinedPlayers = [];
            if (!t.joinedPlayers.includes(userId)) {
                t.joinedPlayers.push(userId);
                this.saveTournaments(tournaments);
                return true;
            }
        }
        return false;
    },

    // ---------- PAYMENT / SETTINGS ----------
    getSettings() {
        let settings = this.get('bfr_settings', null);
        if (!settings) {
            settings = {
                upiId: 'battleffroyale@upi',
                upiName: 'Battle FF Royale',
                qrCode: '',
                telegramLink: 'https://t.me/',
                whatsappLink: 'https://wa.me/',
                siteName: 'Battle FF Royale',
                minRecharge: 10,
                withdrawalCharge: 5
            };
            this.set('bfr_settings', settings);
        }
        return settings;
    },

    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        this.set('bfr_settings', newSettings);
        return newSettings;
    },

    // ---------- PAYMENT REQUESTS ----------
    getPayments() {
        return this.get('bfr_payments', []);
    },

    savePayments(payments) {
        this.set('bfr_payments', payments);
    },

    addPayment(payment) {
        const payments = this.getPayments();
        payment.id = 'P' + Date.now() + Math.random().toString(36).substr(2, 5);
        payment.status = 'pending';
        payment.createdAt = new Date().toISOString();
        payments.push(payment);
        this.savePayments(payments);
        return payment;
    },

    updatePayment(paymentId, updates) {
        const payments = this.getPayments();
        const index = payments.findIndex(p => p.id === paymentId);
        if (index !== -1) {
            payments[index] = { ...payments[index], ...updates };
            this.savePayments(payments);
            return payments[index];
        }
        return null;
    },

    getPendingPayments() {
        return this.getPayments().filter(p => p.status === 'pending');
    },

    // ---------- IMAGE HANDLING ----------
    fileToBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = function (e) {
            callback(e.target.result);
        };
        reader.onerror = function () {
            callback('');
        };
        reader.readAsDataURL(file);
    },

    // ---------- UTILITY ----------
    generateId(prefix = 'ID') {
        return prefix + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },

    formatDateTime(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 99999;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ff8800'};
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ---------- UPI LINK GENERATOR ----------
    generateUPILink(upiId, name, amount, note) {
        return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    },

    generateGooglePayLink(upiId, name, amount, note) {
        return `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    },

    generatePhonePeLink(upiId, name, amount, note) {
        return `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    },

    generatePaytmLink(upiId, name, amount, note) {
        return `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    },

    generateBHIMLink(upiId, name, amount, note) {
        return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    },

    generateAmazonPayLink(upiId, name, amount, note) {
        return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    }
};

// Add toast animation CSS
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyle);
