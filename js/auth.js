// ============================================
// BATTLE FF ROYALE - USER AUTHENTICATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    // ----- REGISTRATION -----
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('regUsername').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const mobile = document.getElementById('regMobile').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;

            // Validations
            if (username.length < 3) {
                BFR.showToast('Username must be at least 3 characters!', 'error');
                return;
            }
            if (!email.includes('@')) {
                BFR.showToast('Please enter a valid email!', 'error');
                return;
            }
            if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
                BFR.showToast('Please enter a valid 10-digit mobile number!', 'error');
                return;
            }
            if (password.length < 4) {
                BFR.showToast('Password must be at least 4 characters!', 'error');
                return;
            }
            if (password !== confirmPassword) {
                BFR.showToast('Passwords do not match!', 'error');
                return;
            }

            // Check if username or email already exists
            const users = BFR.getUsers();
            const exists = users.find(u => u.username === username || u.email === email);
            if (exists) {
                BFR.showToast('Username or Email already registered!', 'error');
                return;
            }

            // Create user
            const newUser = BFR.addUser({
                username: username,
                email: email,
                mobile: mobile,
                password: password
            });

            BFR.showToast('Registration successful! Please login.', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    // ----- USER LOGIN -----
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!username || !password) {
                BFR.showToast('Please fill all fields!', 'error');
                return;
            }

            const user = BFR.findUser(username, password);

            if (user) {
                BFR.setUserSession(user);
                BFR.showToast('Login successful! Welcome ' + user.username, 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                BFR.showToast('Invalid credentials! Please check your username and password.', 'error');
            }
        });
    }

    // ----- ADMIN LOGIN -----
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value;

            if (!username || !password) {
                BFR.showToast('Please fill all fields!', 'error');
                return;
            }

            const admin = BFR.findAdmin(username, password);

            if (admin) {
                BFR.setAdminSession(admin);
                BFR.showToast('Admin Login successful!', 'success');
                setTimeout(() => {
                    window.location.reload(); // Reload to show admin panel
                }, 500);
            } else {
                BFR.showToast('Invalid admin credentials!', 'error');
            }
        });
    }

    // ----- PROTECT USER PAGES -----
    const userPages = ['dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    if (userPages.includes(currentPage)) {
        const session = BFR.getUserSession();
        if (!session) {
            window.location.href = 'login.html';
        }
    }

    // ----- PROTECT ADMIN PAGES -----
    if (currentPage === 'admin.html') {
        const adminSession = BFR.getAdminSession();
        const adminPanel = document.getElementById('adminPanel');
        const adminLoginSection = document.getElementById('adminLoginSection');
        if (adminSession && adminPanel && adminLoginSection) {
            adminLoginSection.style.display = 'none';
            adminPanel.style.display = 'block';
        }
    }

    // ----- LOGOUT -----
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            BFR.clearUserSession();
            BFR.clearAdminSession();
            window.location.href = 'index.html';
        });
    });

    // ----- LOGOUT USER ONLY -----
    document.querySelectorAll('.btn-logout-user').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            BFR.clearUserSession();
            window.location.href = 'login.html';
        });
    });

    // ----- LOGOUT ADMIN ONLY -----
    document.querySelectorAll('.btn-logout-admin').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            BFR.clearAdminSession();
            window.location.reload();
        });
    });
});
