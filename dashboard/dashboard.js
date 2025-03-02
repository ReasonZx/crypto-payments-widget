document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login/';
    } else {
        document.body.classList.remove('loading');
    }

    // Check token at page load
    if (!checkTokenExpiration() && requiresAuthentication) {
        window.location.href = '../login/?expired=true';
        return;
    }
    
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const tabContents = document.querySelectorAll('.tab-content');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all sidebar items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to the clicked item
            item.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            // Show the selected tab content
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // If customers tab and data is loaded, trigger processing
            if (tabId === 'customers' && window.transactionsDataLoaded) {
                // Dispatch custom event to notify customers.js
                window.dispatchEvent(new CustomEvent('customersTabActive'));
            }
        });
    });
});


function checkTokenExpiration() {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('tokenExpires');
    
    // If no token or expiration, user isn't logged in
    if (!token || !expiresAt) {
        return false;
    }
    
    // Check if token has expired
    if (Date.now() >= parseInt(expiresAt)) {
        // Token expired, clear storage and return false
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('tokenExpires');
        return false;
    }
    
    // Token is still valid
    return true;
}