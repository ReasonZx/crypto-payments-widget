document.addEventListener('DOMContentLoaded', () => {
    // Handle expandable sidebar items
    const expandableItems = document.querySelectorAll('.expandable');
    
    expandableItems.forEach(item => {
        const link = item.querySelector('.has-children');
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            item.classList.toggle('expanded');
        });
    });

    // Add copy functionality to code blocks
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach(block => {
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        
        // Add button to code block
        block.appendChild(copyButton);
        
        // Handle copy click
        copyButton.addEventListener('click', () => {
            const code = block.querySelector('code').innerText;
            copyToClipboard(code, copyButton);
        });
    });

    // Function to copy text to clipboard
    function copyToClipboard(text, button) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            
            // Visual feedback
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.backgroundColor = '#4dbb9a';
            button.style.color = 'white';
            button.style.borderColor = '#4dbb9a';
            
            // Reset after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '';
                button.style.color = '';
                button.style.borderColor = '';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        document.body.removeChild(textarea);
    }

    // Handle authentication state
    function updateNavButtons() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const navButtons = document.querySelector('.nav-buttons');
        
        if (token && navButtons) {
            navButtons.innerHTML = `
                <a href="../dashboard/" class="btn btn-login">Dashboard</a>
                <button onclick="handleLogout()" class="btn btn-primary">Log out</button>
            `;
        }
    }
    
    updateNavButtons();

    // Contact support email functionality
    const contactLink = document.querySelector('.footer-links a[href^="mailto:"]');
    
    if (contactLink) {
        contactLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the email address from href
            const email = this.getAttribute('href').replace('mailto:', '');
            
            // Copy to clipboard
            navigator.clipboard.writeText(email)
                .then(() => {
                    showToast('Email address copied to clipboard', 'success');
                })
                .catch(err => {
                    console.error('Could not copy email: ', err);
                    showToast('Could not copy email address', 'error');
                });
        });
    }
    
    // Toast notification function
    function showToast(message, type = 'success') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '10000';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Show toast after a brief delay
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toastContainer.removeChild(toast), 300);
        }, 3000);
    }
});