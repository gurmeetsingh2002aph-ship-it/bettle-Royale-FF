// ============================================
// BATTLE FF ROYALE - ADMIN PANEL
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    // ----- CHECK ADMIN SESSION -----
    const adminSession = BFR.getAdminSession();
    const adminLoginSection = document.getElementById('adminLoginSection');
    const adminPanel = document.getElementById('adminPanel');

    if (adminSession && adminPanel && adminLoginSection) {
        adminLoginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        initializeAdminPanel();
    }

    function initializeAdminPanel() {

        // ----- NAVIGATION -----
        const navBtns = document.querySelectorAll('.admin-nav-btn');
        const sections = document.querySelectorAll('.admin-section');

        navBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const target = this.getAttribute('data-section');
                navBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                sections.forEach(s => s.style.display = 'none');
                const targetSection = document.getElementById(target + 'Section');
                if (targetSection) targetSection.style.display = 'block';

                if (target === 'tournaments') loadTournamentList();
                if (target === 'users') loadUserList();
                if (target === 'payments') loadPaymentRequests();
                if (target === 'settings') loadSettings();
                if (target === 'dashboard') loadDashboardStats();
            });
        });

        // ----- DASHBOARD STATS -----
        function loadDashboardStats() {
            const users = BFR.getUsers();
            const tournaments = BFR.getTournaments();
            const payments = BFR.getPayments();
            const pendingPayments = payments.filter(p => p.status === 'pending');

            document.getElementById('statUsers').textContent = users.length;
            document.getElementById('statTournaments').textContent = tournaments.length;
            document.getElementById('statPending').textContent = pendingPayments.length;
            document.getElementById('statTotalEarnings').textContent =
                '₹' + payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
        }

        loadDashboardStats();

        // ----- TOURNAMENT FORM -----
        const tournamentForm = document.getElementById('tournamentForm');
        let editingTournamentId = null;
        let tournamentBannerBase64 = '';

        // Banner upload
        const bannerUpload = document.getElementById('bannerUpload');
        const bannerPreview = document.getElementById('bannerPreview');

        if (bannerUpload) {
            bannerUpload.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    BFR.fileToBase64(file, function (base64) {
                        tournamentBannerBase64 = base64;
                        if (bannerPreview) {
                            bannerPreview.innerHTML = `<img src="${base64}" alt="Banner Preview" style="max-width:300px;border-radius:10px;">`;
                        }
                    });
                }
            });
        }

        if (tournamentForm) {
            tournamentForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const data = {
                    name: document.getElementById('tourName').value.trim(),
                    game: document.getElementById('tourGame').value.trim() || 'Battle FF Royale',
                    entryFee: parseFloat(document.getElementById('tourEntryFee').value),
                    prizePool: parseFloat(document.getElementById('tourPrizePool').value),
                    perKill: parseFloat(document.getElementById('tourPerKill').value) || 0,
                    totalPlayers: parseInt(document.getElementById('tourTotalPlayers').value),
                    date: document.getElementById('tourDate').value,
                    time: document.getElementById('tourTime').value,
                    roomCode: document.getElementById('tourRoomCode').value.trim(),
                    description: document.getElementById('tourDesc').value.trim(),
                    status: document.getElementById('tourStatus').value,
                    banner: tournamentBannerBase64
                };

                if (!data.name) {
                    BFR.showToast('Please enter tournament name!', 'error');
                    return;
                }

                if (editingTournamentId) {
                    BFR.updateTournament(editingTournamentId, data);
                    BFR.showToast('Tournament updated successfully!', 'success');
                } else {
                    BFR.addTournament(data);
                    BFR.showToast('Tournament created successfully!', 'success');
                }

                // Reset form
                tournamentForm.reset();
                editingTournamentId = null;
                tournamentBannerBase64 = '';
                if (bannerPreview) bannerPreview.innerHTML = '';
                document.getElementById('formTitle').textContent = '➕ Create Tournament';
                document.getElementById('submitBtn').textContent = 'Create Tournament';
                document.getElementById('cancelEditBtn').style.display = 'none';

                loadTournamentList();
                loadDashboardStats();
            });
        }

        // Cancel edit
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function () {
                tournamentForm.reset();
                editingTournamentId = null;
                tournamentBannerBase64 = '';
                if (bannerPreview) bannerPreview.innerHTML = '';
                document.getElementById('formTitle').textContent = '➕ Create Tournament';
                document.getElementById('submitBtn').textContent = 'Create Tournament';
                this.style.display = 'none';
            });
        }

        // ----- TOURNAMENT LIST -----
        function loadTournamentList() {
            const container = document.getElementById('tournamentListAdmin');
            if (!container) return;

            const tournaments = BFR.getTournaments();

            if (tournaments.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>🎮 No Tournaments</h3><p>Create your first tournament!</p></div>';
                return;
            }

            container.innerHTML = tournaments.map(t => `
                <div class="tournament-card admin-tournament-card">
                    <div class="tournament-banner">
                        ${t.banner ? `<img src="${t.banner}" alt="${t.name}">` : `<div class="no-banner">🎮 ${t.name}</div>`}
                        <span class="tournament-status status-${t.status}">${t.status.toUpperCase()}</span>
                    </div>
                    <div class="tournament-info">
                        <h3>${t.name}</h3>
                        <div class="tournament-details">
                            <div class="detail"><span>🎯 Game:</span><b>${t.game || 'Battle FF Royale'}</b></div>
                            <div class="detail"><span>💰 Entry:</span><b>₹${t.entryFee}</b></div>
                            <div class="detail"><span>🏆 Prize:</span><b>₹${t.prizePool}</b></div>
                            <div class="detail"><span>⚔️ Per Kill:</span><b>₹${t.perKill || 0}</b></div>
                            <div class="detail"><span>📅 Date:</span><b>${t.date} ${t.time || ''}</b></div>
                            <div class="detail"><span>👥 Players:</span><b>${t.joinedPlayers ? t.joinedPlayers.length : 0}/${t.totalPlayers}</b></div>
                            ${t.roomCode ? `<div class="detail"><span>🔑 Room:</span><b>${t.roomCode}</b></div>` : ''}
                        </div>
                        <div class="tournament-actions">
                            <button class="btn btn-warning edit-tour-btn" data-id="${t.id}">✏️ Edit</button>
                            <button class="btn btn-danger delete-tour-btn" data-id="${t.id}">🗑️ Delete</button>
                            ${t.status === 'upcoming' ? `<button class="btn btn-info start-tour-btn" data-id="${t.id}">▶️ Start</button>` : ''}
                            ${t.status === 'live' ? `<button class="btn btn-success complete-tour-btn" data-id="${t.id}">✅ Complete</button>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

            // Edit
            container.querySelectorAll('.edit-tour-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const tId = this.getAttribute('data-id');
                    const t = BFR.getTournamentById(tId);
                    if (!t) return;

                    editingTournamentId = tId;
                    tournamentBannerBase64 = t.banner || '';

                    document.getElementById('tourName').value = t.name;
                    document.getElementById('tourGame').value = t.game || 'Battle FF Royale';
                    document.getElementById('tourEntryFee').value = t.entryFee;
                    document.getElementById('tourPrizePool').value = t.prizePool;
                    document.getElementById('tourPerKill').value = t.perKill || 0;
                    document.getElementById('tourTotalPlayers').value = t.totalPlayers;
                    document.getElementById('tourDate').value = t.date;
                    document.getElementById('tourTime').value = t.time;
                    document.getElementById('tourRoomCode').value = t.roomCode || '';
                    document.getElementById('tourDesc').value = t.description || '';
                    document.getElementById('tourStatus').value = t.status;

                    if (bannerPreview && t.banner) {
                        bannerPreview.innerHTML = `<img src="${t.banner}" alt="Banner" style="max-width:300px;border-radius:10px;">`;
                    }

                    document.getElementById('formTitle').textContent = '✏️ Edit Tournament';
                    document.getElementById('submitBtn').textContent = 'Update Tournament';
                    document.getElementById('cancelEditBtn').style.display = 'inline-block';

                    // Scroll to form
                    document.getElementById('tournamentForm').scrollIntoView({ behavior: 'smooth' });
                });
            });

            // Delete
            container.querySelectorAll('.delete-tour-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const tId = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this tournament?')) {
                        BFR.deleteTournament(tId);
                        BFR.showToast('Tournament deleted!', 'success');
                        loadTournamentList();
                        loadDashboardStats();
                    }
                });
            });

            // Start
            container.querySelectorAll('.start-tour-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const tId = this.getAttribute('data-id');
                    BFR.updateTournament(tId, { status: 'live' });
                    BFR.showToast('Tournament started!', 'success');
                    loadTournamentList();
                });
            });

            // Complete
            container.querySelectorAll('.complete-tour-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const tId = this.getAttribute('data-id');
                    BFR.updateTournament(tId, { status: 'completed' });
                    BFR.showToast('Tournament completed!', 'success');
                    loadTournamentList();
                });
            });
        }

        // ----- USER LIST -----
        function loadUserList() {
            const container = document.getElementById('userListAdmin');
            if (!container) return;

            const users = BFR.getUsers();

            if (users.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>👥 No Users</h3></div>';
                return;
            }

            container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Wallet</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td>${u.id}</td>
                                <td>${u.username}</td>
                                <td>${u.email}</td>
                                <td>${u.mobile}</td>
                                <td>₹${u.wallet.toFixed(2)}</td>
                                <td><span class="status-badge status-${u.status}">${u.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-warning add-wallet-btn" data-id="${u.id}">+₹</button>
                                    <button class="btn btn-sm btn-info deduct-wallet-btn" data-id="${u.id}">-₹</button>
                                    <button class="btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-success'} toggle-user-btn" data-id="${u.id}">
                                        ${u.status === 'active' ? 'Ban' : 'Unban'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Add wallet
            container.querySelectorAll('.add-wallet-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const userId = this.getAttribute('data-id');
                    const amount = prompt('Enter amount to add:');
                    if (amount && parseFloat(amount) > 0) {
                        const user = BFR.findUserById(userId);
                        BFR.updateUser(userId, { wallet: user.wallet + parseFloat(amount) });
                        BFR.showToast('Wallet updated!', 'success');
                        loadUserList();
                    }
                });
            });

            // Deduct wallet
            container.querySelectorAll('.deduct-wallet-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const userId = this.getAttribute('data-id');
                    const amount = prompt('Enter amount to deduct:');
                    if (amount && parseFloat(amount) > 0) {
                        const user = BFR.findUserById(userId);
                        BFR.updateUser(userId, { wallet: Math.max(0, user.wallet - parseFloat(amount)) });
                        BFR.showToast('Wallet updated!', 'success');
                        loadUserList();
                    }
                });
            });

            // Toggle user status
            container.querySelectorAll('.toggle-user-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const userId = this.getAttribute('data-id');
                    const user = BFR.findUserById(userId);
                    const newStatus = user.status === 'active' ? 'banned' : 'active';
                    BFR.updateUser(userId, { status: newStatus });
                    BFR.showToast(`User ${newStatus === 'active' ? 'unbanned' : 'banned'}!`, 'success');
                    loadUserList();
                });
            });
        }

        // ----- PAYMENT REQUESTS -----
        function loadPaymentRequests() {
            const container = document.getElementById('paymentRequestsAdmin');
            if (!container) return;

            const payments = BFR.getPayments();

            if (payments.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>💳 No Payment Requests</h3></div>';
                return;
            }

            container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>UTR</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(p => `
                            <tr>
                                <td>${p.id}</td>
                                <td>${p.username}</td>
                                <td>₹${p.amount}</td>
                                <td>${p.utr}</td>
                                <td>${BFR.formatDateTime(p.createdAt)}</td>
                                <td><span class="status-badge status-${p.status}">${p.status}</span></td>
                                <td>
                                    ${p.status === 'pending' ? `
                                        <button class="btn btn-sm btn-success approve-btn" data-id="${p.id}" data-user="${p.userId}" data-amount="${p.amount}">✅ Approve</button>
                                        <button class="btn btn-sm btn-danger reject-btn" data-id="${p.id}">❌ Reject</button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Approve
            container.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const pId = this.getAttribute('data-id');
                    const uId = this.getAttribute('data-user');
                    const amount = parseFloat(this.getAttribute('data-amount'));

                    if (confirm(`Approve payment of ₹${amount}?`)) {
                        BFR.updatePayment(pId, { status: 'approved' });
                        const user = BFR.findUserById(uId);
                        if (user) {
                            BFR.updateUser(uId, { wallet: user.wallet + amount });
                        }
                        BFR.showToast('Payment approved! Wallet credited.', 'success');
                        loadPaymentRequests();
                        loadDashboardStats();
                    }
                });
            });

            // Reject
            container.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const pId = this.getAttribute('data-id');
                    if (confirm('Reject this payment?')) {
                        BFR.updatePayment(pId, { status: 'rejected' });
                        BFR.showToast('Payment rejected!', 'success');
                        loadPaymentRequests();
                    }
                });
            });
        }

        // ----- SETTINGS -----
        function loadSettings() {
            const settings = BFR.getSettings();

            const upiIdField = document.getElementById('settingsUpiId');
            const upiNameField = document.getElementById('settingsUpiName');
            const telegramField = document.getElementById('settingsTelegram');
            const whatsappField = document.getElementById('settingsWhatsapp');
            const minRechargeField = document.getElementById('settingsMinRecharge');
            const qrPreview = document.getElementById('qrPreviewAdmin');

            if (upiIdField) upiIdField.value = settings.upiId;
            if (upiNameField) upiNameField.value = settings.upiName;
            if (telegramField) telegramField.value = settings.telegramLink;
            if (whatsappField) whatsappField.value = settings.whatsappLink;
            if (minRechargeField) minRechargeField.value = settings.minRecharge;

            if (qrPreview) {
                if (settings.qrCode) {
                    qrPreview.innerHTML = `<img src="${settings.qrCode}" alt="QR Code" style="max-width:300px;border-radius:10px;">`;
                } else {
                    qrPreview.innerHTML = '<div class="no-qr">No QR Code uploaded</div>';
                }
            }
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const updates = {
                    upiId: document.getElementById('settingsUpiId').value.trim(),
                    upiName: document.getElementById('settingsUpiName').value.trim(),
                    telegramLink: document.getElementById('settingsTelegram').value.trim(),
                    whatsappLink: document.getElementById('settingsWhatsapp').value.trim(),
                    minRecharge: parseFloat(document.getElementById('settingsMinRecharge').value) || 10
                };

                BFR.updateSettings(updates);
                BFR.showToast('Settings updated successfully!', 'success');
            });
        }

        // QR Code Upload
        const qrUpload = document.getElementById('qrUpload');
        if (qrUpload) {
            qrUpload.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    BFR.fileToBase64(file, function (base64) {
                        BFR.updateSettings({ qrCode: base64 });
                        const qrPreview = document.getElementById('qrPreviewAdmin');
                        if (qrPreview) {
                            qrPreview.innerHTML = `<img src="${base64}" alt="QR Code" style="max-width:300px;border-radius:10px;">`;
                        }
                        BFR.showToast('QR Code uploaded successfully!', 'success');
                    });
                }
            });
        }

        // Admin Password Change
        const adminPasswordForm = document.getElementById('adminPasswordForm');
        if (adminPasswordForm) {
            adminPasswordForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const currentPass = document.getElementById('currentAdminPass').value;
                const newPass = document.getElementById('newAdminPass').value;
                const confirmPass = document.getElementById('confirmAdminPass').value;

                const admin = BFR.findAdmin(adminSession.username, currentPass);
                if (!admin) {
                    BFR.showToast('Current password is wrong!', 'error');
                    return;
                }
                if (newPass !== confirmPass) {
                    BFR.showToast('New passwords do not match!', 'error');
                    return;
                }
                if (newPass.length < 4) {
                    BFR.showToast('New password must be at least 4 characters!', 'error');
                    return;
                }

                BFR.updateAdminPassword(adminSession.username, newPass);
                BFR.showToast('Admin password updated!', 'success');
                adminPasswordForm.reset();
            });
        }
    }
});
