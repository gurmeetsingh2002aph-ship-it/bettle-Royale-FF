// ============================================
// BATTLE FF ROYALE - USER DASHBOARD
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const session = BFR.getUserSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = BFR.findUserById(session.id);
    if (!currentUser) {
        BFR.clearUserSession();
        window.location.href = 'login.html';
        return;
    }

    // ----- Display Username -----
    const usernameDisplays = document.querySelectorAll('.user-name-display');
    usernameDisplays.forEach(el => el.textContent = currentUser.username);

    // ----- Display Wallet -----
    const walletDisplays = document.querySelectorAll('.wallet-amount');
    walletDisplays.forEach(el => el.textContent = '₹' + currentUser.wallet.toFixed(2));

    // ----- NAVIGATION -----
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.dashboard-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const target = this.getAttribute('data-section');
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(s => s.style.display = 'none');
            const targetSection = document.getElementById(target + 'Section');
            if (targetSection) targetSection.style.display = 'block';

            if (target === 'tournaments') loadTournaments();
            if (target === 'recharge') loadRecharge();
            if (target === 'my-tournaments') loadMyTournaments();
            if (target === 'payment-history') loadPaymentHistory();
        });
    });

    // ----- LOAD TOURNAMENTS -----
    function loadTournaments() {
        const container = document.getElementById('tournamentList');
        if (!container) return;

        const tournaments = BFR.getTournaments().filter(t => t.status !== 'completed');
        if (tournaments.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>🎮 No Tournaments Available</h3><p>Stay tuned for upcoming tournaments!</p></div>';
            return;
        }

        container.innerHTML = tournaments.map(t => {
            const joined = t.joinedPlayers && t.joinedPlayers.includes(currentUser.id);
            const totalPlayers = t.joinedPlayers ? t.joinedPlayers.length : 0;

            return `
                <div class="tournament-card">
                    <div class="tournament-banner">
                        ${t.banner ? `<img src="${t.banner}" alt="${t.name}">` : `<div class="no-banner">🎮 ${t.name}</div>`}
                        <span class="tournament-status status-${t.status}">${t.status.toUpperCase()}</span>
                    </div>
                    <div class="tournament-info">
                        <h3>${t.name}</h3>
                        <div class="tournament-details">
                            <div class="detail"><span>🎯 Game:</span><b>${t.game || 'Battle FF Royale'}</b></div>
                            <div class="detail"><span>💰 Entry:</span><b>₹${t.entryFee}</b></div>
                            <div class="detail"><span>🏆 Prize Pool:</span><b>₹${t.prizePool}</b></div>
                            <div class="detail"><span>⚔️ Per Kill:</span><b>₹${t.perKill || 0}</b></div>
                            <div class="detail"><span>📅 Date:</span><b>${t.date} ${t.time || ''}</b></div>
                            <div class="detail"><span>👥 Players:</span><b>${totalPlayers}/${t.totalPlayers}</b></div>
                        </div>
                        ${t.description ? `<p class="tournament-desc">${t.description}</p>` : ''}
                        <div class="tournament-actions">
                            ${joined ?
                    `<button class="btn btn-success" disabled>✅ Joined</button>` :
                    `<button class="btn btn-primary join-btn" data-id="${t.id}" data-fee="${t.entryFee}">⚡ Join Now</button>`
                }
                            <button class="btn btn-outline share-btn" data-id="${t.id}">📤 Share</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Join button events
        container.querySelectorAll('.join-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const tId = this.getAttribute('data-id');
                const fee = parseFloat(this.getAttribute('data-fee'));
                const t = BFR.getTournamentById(tId);

                if (currentUser.wallet < fee) {
                    BFR.showToast('Insufficient balance! Please recharge first.', 'error');
                    return;
                }

                if (confirm(`Join "${t.name}" for ₹${fee}?`)) {
                    // Deduct wallet
                    BFR.updateUser(currentUser.id, { wallet: currentUser.wallet - fee });
                    currentUser.wallet -= fee;

                    // Join tournament
                    BFR.joinTournament(tId, currentUser.id);

                    BFR.showToast('Successfully joined the tournament! 🎉', 'success');

                    // Update wallet display
                    walletDisplays.forEach(el => el.textContent = '₹' + currentUser.wallet.toFixed(2));

                    loadTournaments();
                }
            });
        });
    }

    // ----- LOAD MY TOURNAMENTS -----
    function loadMyTournaments() {
        const container = document.getElementById('myTournamentList');
        if (!container) return;

        const allTournaments = BFR.getTournaments();
        const myTournaments = allTournaments.filter(t =>
            t.joinedPlayers && t.joinedPlayers.includes(currentUser.id)
        );

        if (myTournaments.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>🎮 No Joined Tournaments</h3><p>Join a tournament from the Tournaments section!</p></div>';
            return;
        }

        container.innerHTML = myTournaments.map(t => `
            <div class="tournament-card my-tournament">
                <div class="tournament-banner">
                    ${t.banner ? `<img src="${t.banner}" alt="${t.name}">` : `<div class="no-banner">🎮 ${t.name}</div>`}
                    <span class="tournament-status status-${t.status}">${t.status.toUpperCase()}</span>
                </div>
                <div class="tournament-info">
                    <h3>${t.name}</h3>
                    <div class="tournament-details">
                        <div class="detail"><span>📅 Date:</span><b>${t.date} ${t.time || ''}</b></div>
                        <div class="detail"><span>🏆 Prize:</span><b>₹${t.prizePool}</b></div>
                        <div class="detail"><span>🎮 Game:</span><b>${t.game || 'Battle FF Royale'}</b></div>
                    </div>
                    ${t.status === 'live' && t.roomCode ? `
                        <div class="room-code-box">
                            <span>🔑 Room Code:</span>
                            <b class="room-code">${t.roomCode}</b>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // ----- LOAD RECHARGE SECTION -----
    function loadRecharge() {
        const settings = BFR.getSettings();
        const qrContainer = document.getElementById('qrDisplay');
        const upiIdDisplay = document.getElementById('upiIdDisplay');

        if (upiIdDisplay) upiIdDisplay.textContent = settings.upiId;

        if (qrContainer) {
            if (settings.qrCode) {
                qrContainer.innerHTML = `<img src="${settings.qrCode}" alt="UPI QR Code" class="qr-image">`;
            } else {
                qrContainer.innerHTML = '<div class="no-qr">QR Code not available</div>';
            }
        }

        // Generate UPI Links
        const amount = document.getElementById('rechargeAmount');
        if (amount) {
            amount.addEventListener('input', function () {
                updateUPILinks(this.value);
            });
            updateUPILinks(amount.value || 100);
        }
    }

    function updateUPILinks(amt) {
        const settings = BFR.getSettings();
        const amount = parseFloat(amt) || 0;
        const note = 'Battle FF Royale Recharge';

        const links = {
            googlepay: BFR.generateGooglePayLink(settings.upiId, settings.upiName, amount, note),
            phonepe: BFR.generatePhonePeLink(settings.upiId, settings.upiName, amount, note),
            paytm: BFR.generatePaytmLink(settings.upiId, settings.upiName, amount, note),
            bhim: BFR.generateBHIMLink(settings.upiId, settings.upiName, amount, note),
            amazon: BFR.generateAmazonPayLink(settings.upiId, settings.upiName, amount, note),
            generic: BFR.generateUPILink(settings.upiId, settings.upiName, amount, note)
        };

        // Update link hrefs
        if (document.getElementById('gpayLink')) document.getElementById('gpayLink').href = links.googlepay;
        if (document.getElementById('phonepeLink')) document.getElementById('phonepeLink').href = links.phonepe;
        if (document.getElementById('paytmLink')) document.getElementById('paytmLink').href = links.paytm;
        if (document.getElementById('bhimLink')) document.getElementById('bhimLink').href = links.bhim;
        if (document.getElementById('amazonLink')) document.getElementById('amazonLink').href = links.amazon;
        if (document.getElementById('genericUpiLink')) document.getElementById('genericUpiLink').href = links.generic;

        // Update displayed amount
        const displayAmount = document.getElementById('displayAmount');
        if (displayAmount) displayAmount.textContent = '₹' + amount;
    }

    // ----- RECHARGE SUBMIT -----
    const rechargeForm = document.getElementById('rechargeForm');
    if (rechargeForm) {
        rechargeForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const amount = parseFloat(document.getElementById('rechargeAmount').value);
            const utr = document.getElementById('rechargeUTR').value.trim();

            if (!amount || amount < 10) {
                BFR.showToast('Minimum recharge is ₹10!', 'error');
                return;
            }
            if (!utr || utr.length < 8) {
                BFR.showToast('Please enter a valid UTR/Transaction ID (min 8 characters)!', 'error');
                return;
            }

            BFR.addPayment({
                userId: currentUser.id,
                username: currentUser.username,
                amount: amount,
                utr: utr,
                method: 'UPI',
                type: 'recharge'
            });

            BFR.showToast('Recharge request submitted! It will be verified by admin soon.', 'success');
            document.getElementById('rechargeUTR').value = '';
        });
    }

    // ----- COPY UPI ID -----
    const copyUpiBtn = document.getElementById('copyUpiBtn');
    if (copyUpiBtn) {
        copyUpiBtn.addEventListener('click', function () {
            const settings = BFR.getSettings();
            navigator.clipboard.writeText(settings.upiId).then(() => {
                BFR.showToast('UPI ID copied!', 'success');
            }).catch(() => {
                // Fallback
                const temp = document.createElement('textarea');
                temp.value = settings.upiId;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                temp.remove();
                BFR.showToast('UPI ID copied!', 'success');
            });
        });
    }

    // ----- LOAD PAYMENT HISTORY -----
    function loadPaymentHistory() {
        const container = document.getElementById('paymentHistoryList');
        if (!container) return;

        const payments = BFR.getPayments().filter(p => p.userId === currentUser.id);

        if (payments.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>💳 No Payment History</h3><p>Your recharge history will appear here.</p></div>';
            return;
        }

        container.innerHTML = payments.map(p => `
            <div class="payment-item">
                <div class="payment-info">
                    <b>₹${p.amount}</b>
                    <span class="payment-utr">UTR: ${p.utr}</span>
                    <span class="payment-date">${BFR.formatDateTime(p.createdAt)}</span>
                </div>
                <span class="payment-status status-${p.status}">${p.status.toUpperCase()}</span>
            </div>
        `).join('');
    }

    // ----- PROFILE UPDATE -----
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        document.getElementById('profileUsername').value = currentUser.username;
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profileMobile').value = currentUser.mobile;

        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('profileEmail').value.trim();
            const mobile = document.getElementById('profileMobile').value.trim();
            const newPassword = document.getElementById('profilePassword').value;

            const updates = { email: email, mobile: mobile };
            if (newPassword && newPassword.length >= 4) {
                updates.password = newPassword;
            }

            BFR.updateUser(currentUser.id, updates);
            BFR.showToast('Profile updated successfully!', 'success');
            document.getElementById('profilePassword').value = '';
        });
    }

    // ----- INITIAL LOAD -----
    loadTournaments();
});
