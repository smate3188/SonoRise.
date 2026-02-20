// Email validation function
function isValidEmail(email) {
    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Email formatı düzgün deyil' };
    }
    
    // List of known temporary/fake email domains
    const fakeDomains = [
        'tempmail', 'guerrillamail', '10minutemail', 'throwaway',
        'mailinator', 'fake', 'temp', 'disposable', 'trash',
        'yopmail', 'maildrop', 'getnada', 'sharklasers'
    ];
    
    const domain = email.split('@')[1].toLowerCase();
    
    // Check if it's a fake/temporary email
    for (let fakeDomain of fakeDomains) {
        if (domain.includes(fakeDomain)) {
            return { valid: false, message: 'Müvəqqəti email ünvanları qəbul edilmir. Zəhmət olmasa real email istifadə edin.' };
        }
    }
    
    // Check for common real domains (optional whitelist)
    const realDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'mail.ru', 'yandex.com', 'azercell.com', 'bakcell.com'];
    const isRealDomain = realDomains.some(realDomain => domain === realDomain);
    
    if (!isRealDomain) {
        // Allow other domains but show warning (optional)
        console.log('Email domain is not in common list:', domain);
    }
    
    return { valid: true };
}

// Check if user is already logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = 'dashboard.html';
    }
}

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate email
        const emailValidation = isValidEmail(email);
        if (!emailValidation.valid) {
            showError(emailValidation.message);
            return;
        }
        
        // Simple validation
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            showError('Email və ya şifrə səhvdir');
        }
    });
}

// Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate email
        const emailValidation = isValidEmail(email);
        if (!emailValidation.valid) {
            showError(emailValidation.message);
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.find(u => u.email === email)) {
            showError('Bu email artıq qeydiyyatdan keçib');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            fullName,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('user', JSON.stringify(newUser));
        
        window.location.href = 'dashboard.html';
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
