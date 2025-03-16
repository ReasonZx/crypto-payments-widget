// Function to handle the reset password request
async function handleResetRequest(event) {
    event.preventDefault();

    const form = event.target;
    form.classList.add('form-submitted');
    
    // Get email input
    const email = document.getElementById('email');
    
    // Reset error messages
    document.getElementById('error-message').textContent = '';
    document.querySelectorAll('.validation-message').forEach(msg => {
        msg.style.display = 'none';
    });
    
    // Validate email
    if (!email.value.trim()) {
        email.nextElementSibling.classList.add('show-error');
        email.nextElementSibling.style.display = 'block';
        return;
    } else if (!isValidEmail(email.value)) {
        email.nextElementSibling.classList.add('show-error');
        email.nextElementSibling.textContent = 'Please enter a valid email address';
        email.nextElementSibling.style.display = 'block';
        return;
    }
    
    // If validation passes, proceed with API request
    const formData = {
        email: email.value.trim()
    };

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  
    try {
        const response = await fetch(`${API_URL}/api/request-password-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
  
        if (!response.ok) {
            throw new Error('Failed to request password reset. Please try again.');
        }
  
        // Handle successful request
        const resetFormContainer = document.getElementById('reset-form-container');
        resetFormContainer.innerHTML = `
            <div class="verification-message">
                <div class="verification-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <h2>Check Your Email</h2>
                <p>If <strong>${email.value.trim()}</strong> exists, we've sent password reset instructions to it.</p>
                <p>Click the link in the email to create a new password.</p>
                <div class="verification-actions">
                    <button id="resend-btn" class="btn btn-secondary">Resend Email</button>
                    <a href="../login/" class="btn btn-outline">Back to Login</a>
                </div>
            </div>
        `;
        
        // Add event listener for resend button
        document.getElementById('resend-btn').addEventListener('click', async () => {
            try {
                const resendBtn = document.getElementById('resend-btn');
                resendBtn.disabled = true;
                resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                const response = await fetch(`${API_URL}/api/request-password-reset`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to resend reset email');
                }
                
                resendBtn.innerHTML = '<i class="fas fa-check"></i> Email Sent';
                setTimeout(() => {
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend Email';
                }, 3000);
                
            } catch (error) {
                console.error('Resend error:', error);
                const resendBtn = document.getElementById('resend-btn');
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend Email';
                alert('Failed to resend reset email. Please try again.');
            }
        });
      
    } catch (error) {
        console.error('Reset request error:', error);
        document.getElementById('error-message').textContent = error.message || 'Failed to request password reset. Please try again.';
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// Email validation helper function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add input event listeners to clear validation messages
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            emailInput.nextElementSibling.style.display = 'none';
            emailInput.nextElementSibling.classList.remove('show-error');
            document.getElementById('error-message').textContent = '';
        });
    }
});
