document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login/';
    } else {
        document.body.classList.remove('loading');
    }

    // Check token at page load
    if (!checkTokenExpiration()) {
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

    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    // Check if we have a saved state in localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // Apply initial state
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
    }
    
    // Toggle sidebar on click
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('expanded');
        
        // Save state to localStorage
        localStorage.setItem(
            'sidebarCollapsed', 
            sidebar.classList.contains('collapsed')
        );
    });
    
    // Add tooltip functionality for collapsed sidebar
    sidebarItems.forEach(item => {
        // Use the text as tooltip when collapsed
        const text = item.querySelector('.sidebar-text').textContent;
        item.setAttribute('title', text);
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