
async function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    form.classList.add('form-submitted'); // Add class on form submission

    
    // Get all form inputs
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    // Reset error messages
    document.getElementById('error-message').textContent = '';
    document.querySelectorAll('.validation-message').forEach(msg => {
        msg.style.display = 'none';
    });
    
    // Validate each field
    let isValid = true;
    
    if (!username.value.trim()) {
        username.nextElementSibling.classList.add('show-error');
        username.nextElementSibling.style.display = 'block';
        isValid = false;
    }
    
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
    } else if (password.value.length < 6) {
        password.nextElementSibling.classList.add('show-error');
        password.nextElementSibling.textContent = 'Password must be at least 6 characters';
        password.nextElementSibling.style.display = 'block';
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // If validation passes, proceed with API request
    const formData = {
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value
    };
  
    try {
        const response = await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
  
        if (!response.ok) {
            if(response.status === 409) {
                const responseData = await response.json();
                if (responseData.error === 'Email already registered') {
                    throw new Error('Email already registered');
                }
                else if (responseData.error === 'Username already exists') {
                    throw new Error('Username already exists');
                }
                else {
                    throw new Error('Signup failed. Please try again.');
                }
            }
        }
  
        // Handle successful signup
        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = '../dashboard/';
      
    } catch (error) {
        console.error('Signup error:', error);
        if(error.message === 'Email already in use') {
            document.getElementById('error-message').textContent = 'Email already registered. Please use another.';
            return
        }
        else if(error.message === 'Username already exists') {
            document.getElementById('error-message').textContent = 'Username already exists. Please try another one.';
            return
        }
        document.getElementById('error-message').textContent = 'Signup failed. Please try again.';
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
        input.nextElementSibling.classList.remove('show-error');
        document.getElementById('error-message').textContent = '';
    });
});