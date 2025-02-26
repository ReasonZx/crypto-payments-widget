async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    form.classList.add('form-submitted'); // Add class on form submission

    // Get form inputs
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    // Reset error messages
    document.getElementById('error-message').textContent = '';
    document.querySelectorAll('.validation-message').forEach(msg => {
        msg.style.display = 'none';
    });
    
    // Validate each field
    let isValid = true;
    
    if (!email.value.trim()) {
        email.nextElementSibling.classList.add('show-error');
        email.nextElementSibling.style.display = 'block';
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        email.nextElementSibling.classList.add('show-error');
        email.nextElementSibling.textContent = 'Please enter a valid email address';
        email.nextElementSibling.style.display = 'block';
        isValid = false;
    }
    
    if (!password.value.trim()) {
        password.nextElementSibling.classList.add('show-error');
        password.nextElementSibling.style.display = 'block';
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // If validation passes, proceed with API request
    const formData = {
        email: email.value.trim(),
        password: password.value
    };

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        
        // Store auth token
        localStorage.setItem('token', data.token);
        
        // Store user info if needed
        localStorage.setItem('user', JSON.stringify(data.user));

        updateNavbar();
        
        // Redirect to dashboard
        window.location.href = '../dashboard/';

    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('error-message').textContent = 'Invalid email or password';
    }
}

// Email validation helper function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add input event listeners to clear validation messages
document.querySelectorAll('.auth-form input').forEach(input => {
    input.addEventListener('input', () => {
        input.nextElementSibling.style.display = 'none';
        document.getElementById('error-message').textContent = '';
    });
});