function updateNavbar() {
    const token = localStorage.getItem('token');
    const app = document.getElementById('app');
    const navButtons = document.querySelector('.nav-buttons');
    
    if (token) {
        // User is logged in
        app.classList.add('logged-in');
    } else {
        // User is not logged in
        app.classList.remove('logged-in');
    }

    // Make nav-buttons visible after determining login status
    if (navButtons) {
        navButtons.classList.add('visible');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', updateNavbar);