// Authentication functions using AWS Cognito

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const preLoginNav = document.getElementById('pre-login-nav');
const postLoginNav = document.getElementById('post-login-nav');

// Authentication state
let isAuthenticated = false;
let currentUser = null;

// Check if user is already signed in
async function checkAuthState() {
    try {
        currentUser = await AWS.Amplify.Auth.currentAuthenticatedUser();
        isAuthenticated = true;
        updateUI();
        console.log('User is signed in:', currentUser);
    } catch (error) {
        isAuthenticated = false;
        currentUser = null;
        updateUI();
        console.log('User is not signed in');
    }
}

// Update UI based on authentication state
function updateUI() {
    if (isAuthenticated) {
        preLoginNav.style.display = 'none';
        postLoginNav.style.display = 'block';
    } else {
        preLoginNav.style.display = 'block';
        postLoginNav.style.display = 'none';
    }
}

// Sign in function
async function signIn(username, password) {
    try {
        currentUser = await AWS.Amplify.Auth.signIn(username, password);
        isAuthenticated = true;
        updateUI();
        closeAuthModal();
        console.log('Sign in successful');
        return true;
    } catch (error) {
        console.error('Error signing in:', error);
        document.getElementById('signin-error').textContent = error.message;
        return false;
    }
}

// Sign up function
async function signUp(username, password, email) {
    try {
        const { user } = await AWS.Amplify.Auth.signUp({
            username,
            password,
            attributes: {
                email
            }
        });
        document.getElementById('signup-message').textContent = 'Verification email sent. Please check your inbox.';
        document.getElementById('verification-section').style.display = 'block';
        document.getElementById('signup-section').style.display = 'none';
        console.log('Sign up successful, verification required');
        return true;
    } catch (error) {
        console.error('Error signing up:', error);
        document.getElementById('signup-error').textContent = error.message;
        return false;
    }
}

// Confirm sign up function
async function confirmSignUp(username, code) {
    try {
        await AWS.Amplify.Auth.confirmSignUp(username, code);
        document.getElementById('verification-message').textContent = 'Verification successful! You can now sign in.';
        setTimeout(() => {
            document.getElementById('auth-tab-signin').click();
        }, 2000);
        console.log('Verification successful');
        return true;
    } catch (error) {
        console.error('Error confirming sign up:', error);
        document.getElementById('verification-error').textContent = error.message;
        return false;
    }
}

// Sign out function
async function signOut() {
    try {
        await AWS.Amplify.Auth.signOut();
        isAuthenticated = false;
        currentUser = null;
        updateUI();
        console.log('Sign out successful');
        
        // Redirect to home page if on a protected page
        const currentPath = window.location.pathname;
        if (currentPath.includes('dashboard') || 
            currentPath.includes('profile') || 
            currentPath.includes('my-activity')) {
            window.location.href = '/index.html';
        }
        
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
}

// Forgot password function
async function forgotPassword(username) {
    try {
        await AWS.Amplify.Auth.forgotPassword(username);
        document.getElementById('forgot-message').textContent = 'Password reset code sent to your email.';
        document.getElementById('forgot-reset-section').style.display = 'block';
        document.getElementById('forgot-request-section').style.display = 'none';
        console.log('Password reset requested');
        return true;
    } catch (error) {
        console.error('Error requesting password reset:', error);
        document.getElementById('forgot-error').textContent = error.message;
        return false;
    }
}

// Reset password function
async function resetPassword(username, code, newPassword) {
    try {
        await AWS.Amplify.Auth.forgotPasswordSubmit(username, code, newPassword);
        document.getElementById('reset-message').textContent = 'Password reset successful! You can now sign in.';
        setTimeout(() => {
            document.getElementById('auth-tab-signin').click();
        }, 2000);
        console.log('Password reset successful');
        return true;
    } catch (error) {
        console.error('Error resetting password:', error);
        document.getElementById('reset-error').textContent = error.message;
        return false;
    }
}

// Auth Modal Functions
function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        createAuthModal();
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function createAuthModal() {
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = closeAuthModal;
    
    // Auth tabs
    const authTabs = document.createElement('div');
    authTabs.className = 'auth-tabs';
    
    const signInTab = document.createElement('div');
    signInTab.id = 'auth-tab-signin';
    signInTab.className = 'auth-tab active';
    signInTab.textContent = 'Sign In';
    signInTab.onclick = () => switchAuthTab('signin');
    
    const signUpTab = document.createElement('div');
    signUpTab.id = 'auth-tab-signup';
    signUpTab.className = 'auth-tab';
    signUpTab.textContent = 'Sign Up';
    signUpTab.onclick = () => switchAuthTab('signup');
    
    const forgotTab = document.createElement('div');
    forgotTab.id = 'auth-tab-forgot';
    forgotTab.className = 'auth-tab';
    forgotTab.textContent = 'Forgot Password';
    forgotTab.onclick = () => switchAuthTab('forgot');
    
    authTabs.appendChild(signInTab);
    authTabs.appendChild(signUpTab);
    authTabs.appendChild(forgotTab);
    
    // Tab contents
    const tabContents = document.createElement('div');
    tabContents.className = 'tab-contents';
    
    // Sign In content
    const signInContent = document.createElement('div');
    signInContent.id = 'signin-content';
    signInContent.className = 'tab-content active';
    signInContent.innerHTML = `
        <h2>Sign In</h2>
        <p id="signin-error" class="error-message"></p>
        <form id="signin-form">
            <div class="form-group">
                <label for="signin-username">Username</label>
                <input type="text" id="signin-username" required>
            </div>
            <div class="form-group">
                <label for="signin-password">Password</label>
                <input type="password" id="signin-password" required>
            </div>
            <button type="submit" class="btn">Sign In</button>
        </form>
    `;
    
    // Sign Up content
    const signUpContent = document.createElement('div');
    signUpContent.id = 'signup-content';
    signUpContent.className = 'tab-content';
    signUpContent.innerHTML = `
        <div id="signup-section">
            <h2>Create Account</h2>
            <p id="signup-error" class="error-message"></p>
            <p id="signup-message" class="success-message"></p>
            <form id="signup-form">
                <div class="form-group">
                    <label for="signup-username">Username</label>
                    <input type="text" id="signup-username" required>
                </div>
                <div class="form-group">
                    <label for="signup-email">Email</label>
                    <input type="email" id="signup-email" required>
                </div>
                <div class="form-group">
                    <label for="signup-password">Password</label>
                    <input type="password" id="signup-password" required>
                    <small>Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.</small>
                </div>
                <div class="form-group">
                    <label for="signup-confirm">Confirm Password</label>
                    <input type="password" id="signup-confirm" required>
                </div>
                <button type="submit" class="btn">Sign Up</button>
            </form>
        </div>
        <div id="verification-section" style="display: none;">
            <h2>Verify Your Account</h2>
            <p id="verification-error" class="error-message"></p>
            <p id="verification-message" class="success-message"></p>
            <form id="verification-form">
                <div class="form-group">
                    <label for="verification-username">Username</label>
                    <input type="text" id="verification-username" required>
                </div>
                <div class="form-group">
                    <label for="verification-code">Verification Code</label>
                    <input type="text" id="verification-code" required>
                    <small>Enter the code sent to your email.</small>
                </div>
                <button type="submit" class="btn">Verify</button>
            </form>
        </div>
    `;
    
    // Forgot Password content
    const forgotContent = document.createElement('div');
    forgotContent.id = 'forgot-content';
    forgotContent.className = 'tab-content';
    forgotContent.innerHTML = `
        <div id="forgot-request-section">
            <h2>Forgot Password</h2>
            <p id="forgot-error" class="error-message"></p>
            <p id="forgot-message" class="success-message"></p>
            <form id="forgot-form">
                <div class="form-group">
                    <label for="forgot-username">Username</label>
                    <input type="text" id="forgot-username" required>
                </div>
                <button type="submit" class="btn">Reset Password</button>
            </form>
        </div>
        <div id="forgot-reset-section" style="display: none;">
            <h2>Reset Password</h2>
            <p id="reset-error" class="error-message"></p>
            <p id="reset-message" class="success-message"></p>
            <form id="reset-form">
                <div class="form-group">
                    <label for="reset-username">Username</label>
                    <input type="text" id="reset-username" required>
                </div>
                <div class="form-group">
                    <label for="reset-code">Verification Code</label>
                    <input type="text" id="reset-code" required>
                    <small>Enter the code sent to your email.</small>
                </div>
                <div class="form-group">
                    <label for="reset-password">New Password</label>
                    <input type="password" id="reset-password" required>
                </div>
                <div class="form-group">
                    <label for="reset-confirm">Confirm New Password</label>
                    <input type="password" id="reset-confirm" required>
                </div>
                <button type="submit" class="btn">Set New Password</button>
            </form>
        </div>
    `;
    
    // Add all elements to the modal
    tabContents.appendChild(signInContent);
    tabContents.appendChild(signUpContent);
    tabContents.appendChild(forgotContent);
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(authTabs);
    modalContent.appendChild(tabContents);
    modal.appendChild(modalContent);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('signin-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('signin-username').value;
        const password = document.getElementById('signin-password').value;
        signIn(username, password);
    });
    
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        if (password !== confirm) {
            document.getElementById('signup-error').textContent = 'Passwords do not match';
            return;
        }
        
        signUp(username, password, email);
    });
    
    document.getElementById('verification-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('verification-username').value;
        const code = document.getElementById('verification-code').value;
        confirmSignUp(username, code);
    });
    
    document.getElementById('forgot-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('forgot-username').value;
        forgotPassword(username);
    });
    
    document.getElementById('reset-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('reset-username').value;
        const code = document.getElementById('reset-code').value;
        const password = document.getElementById('reset-password').value;
        const confirm = document.getElementById('reset-confirm').value;
        
        if (password !== confirm) {
            document.getElementById('reset-error').textContent = 'Passwords do not match';
            return;
        }
        
        resetPassword(username, code, password);
    });
    
    // Display the modal
    modal.style.display = 'block';
}

function switchAuthTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Deactivate all tabs
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Activate selected tab and content
    document.getElementById(`auth-tab-${tabName}`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
}

// Event Listeners
if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openAuthModal();
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signOut();
    });
}

// Initialize authentication state on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
});