document.addEventListener('DOMContentLoaded', () => {
    // Load vendor ID from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const vendorID = userData.id || '';
    
    // Set vendor ID in settings form
    const vendorIdInput = document.getElementById('vendor-id');
    const vendorIdCopyBtn = document.querySelector('.copy-btn[data-clipboard]');
    
    if (vendorIdInput) {
        vendorIdInput.value = vendorID;
        vendorIdInput.setAttribute('value', vendorID);
    }
    
    if (vendorIdCopyBtn) {
        vendorIdCopyBtn.setAttribute('data-clipboard', vendorID);
    }
    
    // Function to load vendor configuration
    function loadVendorConfig() {
        const settingsContainer = document.querySelector('.settings-container');
        
        // Show loading state
        if (settingsContainer) {
            // Create loading overlay if it doesn't exist
            if (!document.querySelector('.settings-loading-overlay')) {
                const loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'settings-loading-overlay';
                loadingOverlay.innerHTML = `
                    <div class="settings-loading-spinner"></div>
                    <p>Loading your settings...</p>
                `;
                settingsContainer.appendChild(loadingOverlay);
            }
        }
        
        // Get auth token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Fetch vendor configuration from API
        fetch(`${API_URL}/api/getVendorConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ vendorID })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load vendor configuration');
            }
            return response.json();
        })
        .then(data => {
            console.log('Vendor config loaded:', data);
            
            // Update email field
            const emailInput = document.getElementById('email');
            if (emailInput && data.email) {
                emailInput.value = data.email;
                
                // Update original value for change tracking
                const emailId = emailInput.id || `unnamed-${Math.random().toString(36).substr(2, 9)}`;
                originalValues[emailId] = data.email;
            }
            
            // Update notification settings - MODIFIED SECTION
            // The API returns paymentNotification and summaryNotification directly
            const newPaymentToggle = document.getElementById('new-payment-notify');
            if (newPaymentToggle && data.paymentNotification !== undefined) {
                newPaymentToggle.checked = data.paymentNotification;
                
                // Update original value for change tracking
                const toggleId = newPaymentToggle.id;
                originalValues[toggleId] = newPaymentToggle.checked;
            }
            
            const weeklySummaryToggle = document.getElementById('weekly-summary');
            if (weeklySummaryToggle && data.summaryNotification !== undefined) {
                weeklySummaryToggle.checked = data.summaryNotification;
                
                // Update original value for change tracking
                const toggleId = weeklySummaryToggle.id;
                originalValues[toggleId] = weeklySummaryToggle.checked;
            }
            
            // Remove loading overlay
            const loadingOverlay = document.querySelector('.settings-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        })
        .catch(error => {
            console.error('Error loading vendor configuration:', error);
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'settings-error-message';
            errorMsg.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Failed to load your settings. Please try again.</span>
            `;
            
            // Remove loading overlay
            const loadingOverlay = document.querySelector('.settings-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
            
            // Add error message to the top of settings container
            const settingsContainer = document.querySelector('.settings-container');
            if (settingsContainer) {
                settingsContainer.prepend(errorMsg);
                
                // Remove error after 5 seconds
                setTimeout(() => {
                    errorMsg.remove();
                }, 5000);
            }
        });
    }
    
    // Listen for settings tab click
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            if (this.dataset.tab === 'settings') {
                // Load vendor config when settings tab is clicked
                setTimeout(loadVendorConfig, 100); // Small delay to ensure tab is visible
            }
        });
    });
    
    // Load config immediately if settings tab is already active
    if (document.querySelector('.sidebar-item[data-tab="settings"].active')) {
        loadVendorConfig();
    }
    
    // Track original values of inputs to detect changes
    const originalValues = {};
    
    // Get all sections
    const sections = document.querySelectorAll('.settings-section');
    
    // For each section, store original values and add change listeners
    sections.forEach(section => {
        const sectionTitle = section.querySelector('h4') ? section.querySelector('h4').textContent : '';
        const saveButton = section.querySelector('.settings-save-btn');
        const inputs = section.querySelectorAll('input:not([type="radio"]):not([type="checkbox"])');
        const radios = section.querySelectorAll('input[type="radio"]');
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        
        // Disable save button initially
        saveButton.disabled = true;
        saveButton.classList.add('disabled');
        
        // Store original text input values
        inputs.forEach(input => {
            const inputId = input.id || `unnamed-${Math.random().toString(36).substr(2, 9)}`;
            originalValues[inputId] = input.value;
            
            // Add change listener
            input.addEventListener('input', () => {
                checkForChanges(section);
            });
        });
        
        // Store original radio button states
        const radioGroups = {};
        radios.forEach(radio => {
            const groupName = radio.name;
            if (!radioGroups[groupName]) {
                radioGroups[groupName] = radio.checked ? radio.id : null;
            }
        });
        
        // Add radio button change listeners
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                checkForChanges(section);
            });
        });
        
        // Store original checkbox states
        checkboxes.forEach(checkbox => {
            const checkboxId = checkbox.id || `unnamed-${Math.random().toString(36).substr(2, 9)}`;
            originalValues[checkboxId] = checkbox.checked;
            
            // Add change listener
            checkbox.addEventListener('change', () => {
                checkForChanges(section);
            });
        });
        
        // Function to check for changes in this section
        function checkForChanges(section) {
            let hasChanges = false;
            const sectionTitle = section.querySelector('h4') ? section.querySelector('h4').textContent : '';
            
            // Special handling for Account Settings section
            if (sectionTitle === 'Account Settings') {
                // Check if email has changed
                const emailInput = section.querySelector('#email');
                const emailChanged = emailInput && (emailInput.value !== originalValues[emailInput.id]);
                
                // Check if password is valid (all requirements met)
                let passwordValid = false;
                const newPasswordInput = section.querySelector('#new-password');
                const confirmPasswordInput = section.querySelector('#confirm-password');
                const currentPasswordInput = section.querySelector('#current-password');
                
                if (newPasswordInput && newPasswordInput.value) {
                    // Only check password validity if user is trying to change password
                    const passwordReqs = checkPasswordRequirements(newPasswordInput.value);
                    const allReqsMet = Object.values(passwordReqs).every(Boolean);
                    const passwordsMatch = confirmPasswordInput && (newPasswordInput.value === confirmPasswordInput.value);
                    const currentPasswordEntered = currentPasswordInput && currentPasswordInput.value.trim() !== '';
                    
                    passwordValid = allReqsMet && passwordsMatch && currentPasswordEntered;
                }
                
                // Enable button if email changed OR password is valid
                hasChanges = emailChanged || passwordValid;
            }
            // Original logic for other sections
            else {
                // Check text inputs
                inputs.forEach(input => {
                    const inputId = input.id || `unnamed-${Math.random().toString(36).substr(2, 9)}`;
                    if (input.value !== originalValues[inputId]) {
                        hasChanges = true;
                    }
                });
                
                // Check radio buttons
                Object.keys(radioGroups).forEach(groupName => {
                    const checkedRadio = section.querySelector(`input[name="${groupName}"]:checked`);
                    if (checkedRadio && checkedRadio.id !== radioGroups[groupName]) {
                        hasChanges = true;
                    }
                });
                
                // Check checkboxes
                checkboxes.forEach(checkbox => {
                    const checkboxId = checkbox.id || `unnamed-${Math.random().toString(36).substr(2, 9)}`;
                    if (checkbox.checked !== originalValues[checkboxId]) {
                        hasChanges = true;
                    }
                });
            }
            
            // Update save button state
            saveButton.disabled = !hasChanges;
            if (hasChanges) {
                saveButton.classList.remove('disabled');
            } else {
                saveButton.classList.add('disabled');
            }
        }
        
        // Add click event to save button
        saveButton.addEventListener('click', function() {
            if (this.disabled) return;
            
            // Get the section title
            const sectionTitle = section.querySelector('h4').textContent;
            
            // Update original values to current values
            inputs.forEach(input => {
                const inputId = input.id || `unnamed-${Math.random().toString(36).substr(2, 9)}`;
                originalValues[inputId] = input.value;
            });
            
            Object.keys(radioGroups).forEach(groupName => {
                const checkedRadio = section.querySelector(`input[name="${groupName}"]:checked`);
                if (checkedRadio) {
                    radioGroups[groupName] = checkedRadio.id;
                }
            });
            
            checkboxes.forEach(checkbox => {
                const checkboxId = checkbox.id || `unnamed-${Math.random().toString(36).substr(2, 9)}`;
                originalValues[checkboxId] = checkbox.checked;
            });
            
            // Disable save button again
            this.disabled = true;
            this.classList.add('disabled');
            switch(sectionTitle) {
                case 'Notification Settings':
                    saveNotificationSettings();
                    break;
                case 'Account Settings':
                    saveAccountSettings();
                    break;
                default:
                    break;
            }

        });
    });
    
    // Copy button functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-clipboard');
            copyToClipboard(textToCopy, this);
        });
    });
    
    // Function to copy text to clipboard
    function copyToClipboard(text, button) {
        // Create a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            // Execute copy command
            document.execCommand('copy');
            
            // Visual feedback
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.color = 'var(--primary-color)';
            
            // Reset after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.style.color = '';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        // Remove the temporary textarea
        document.body.removeChild(textarea);
    }
    
    // Function to show save success message
    function showSaveSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'settings-toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="toast-content">
                <p>${message}</p>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function showSaveError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'settings-toast error-toast';
        toast.innerHTML = `
            <div class="toast-icon error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="toast-content">
                <p>${message || 'Failed to save changes'}</p>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove toast after 4 seconds (slightly longer than success toast)
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 4000);
    }
    
    // Password change functionality
    const togglePasswordLink = document.querySelector('.toggle-password-link');
    const changePasswordContainer = document.getElementById('change-password-container');
    
    if (togglePasswordLink && changePasswordContainer) {
        // Toggle password change section visibility
        togglePasswordLink.addEventListener('click', function() {
            changePasswordContainer.classList.toggle('hidden');
            
            // Change the icon based on visibility
            const icon = this.querySelector('i');
            if (changePasswordContainer.classList.contains('hidden')) {
                icon.className = 'fas fa-lock';
            } else {
                icon.className = 'fas fa-lock-open';
                // Focus on the first input when opened
                document.getElementById('current-password').focus();
            }
        });
        
        // Toggle password visibility
        const toggleVisibilityButtons = document.querySelectorAll('.toggle-password-visibility');
        toggleVisibilityButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });
        
        // Password strength check
        const newPassword = document.getElementById('new-password');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        const strengthMeter = document.querySelector('.password-strength-meter');
        
        newPassword.addEventListener('input', function() {
            const password = this.value;
            
            if (password.length === 0) {
                // Reset strength indicators when empty
                strengthMeter.className = 'password-strength-meter';
                strengthText.textContent = 'Password strength';
                strengthBar.style.width = '0';
            } else {
                const strength = checkPasswordStrength(password);
                const requirements = checkPasswordRequirements(password);
                
                // Update strength meter
                strengthMeter.className = 'password-strength-meter';
                
                if (strength === 'weak') {
                    strengthMeter.classList.add('strength-weak');
                    strengthBar.style.width = '33%';
                    strengthText.textContent = 'Weak';
                } else if (strength === 'medium') {
                    strengthMeter.classList.add('strength-medium');
                    strengthBar.style.width = '66%';
                    strengthText.textContent = 'Medium';
                } else {
                    strengthMeter.classList.add('strength-strong');
                    strengthBar.style.width = '100%';
                    strengthText.textContent = 'Strong';
                }
            }
            
            // Update requirements UI (just the length one)
            checkPasswordRequirements(password);
        });
        
        // Password match check
        const confirmPassword = document.getElementById('confirm-password');
        const matchIndicator = document.querySelector('.password-match-indicator');
        const mismatchIndicator = document.querySelector('.password-mismatch-indicator');
        
        function checkPasswordMatch() {
            if (confirmPassword.value === '') {
                matchIndicator.classList.add('hidden');
                mismatchIndicator.classList.add('hidden');
                return;
            }
            
            if (newPassword.value === confirmPassword.value) {
                matchIndicator.classList.remove('hidden');
                mismatchIndicator.classList.add('hidden');
            } else {
                matchIndicator.classList.add('hidden');
                mismatchIndicator.classList.remove('hidden');
            }
        }
        
        newPassword.addEventListener('input', checkPasswordMatch);
        confirmPassword.addEventListener('input', checkPasswordMatch);
        
        // Check password requirements - only enforce 8 character minimum
        function checkPasswordRequirements(password) {
            const requirements = {
                length: password.length >= 8,
            };
            
            // Update requirement indicators
            document.querySelector('.req-length').classList.toggle('valid', requirements.length);
            
            return requirements;
        }
        
        // Function to check password strength - but make it more comprehensive
        function checkPasswordStrength(password) {
            if (password.length === 0) return '';
            
            let score = 0;
            
            // Length - base score
            if (password.length >= 8) score += 1;
            if (password.length >= 10) score += 1;
            if (password.length >= 12) score += 1;
            if (password.length >= 16) score += 1;
            
            // Character variety
            if (/[A-Z]/.test(password)) score += 1; // Has uppercase
            if (/[a-z]/.test(password)) score += 1; // Has lowercase
            if (/[0-9]/.test(password)) score += 1; // Has number
            if (/[^A-Za-z0-9]/.test(password)) score += 2; // Has special character (worth more)
            
            // Complexity patterns
            if (/[a-z].*[A-Z]|[A-Z].*[a-z]/.test(password)) score += 1; // Mix of upper and lower
            if (/[0-9].*[A-Za-z]|[A-Za-z].*[0-9]/.test(password)) score += 1; // Mix of letters and numbers
            if (/[^A-Za-z0-9].*[A-Za-z0-9]|[A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 1; // Mix of letters/numbers and special chars
            
            // Determine strength based on score
            if (score <= 3) return 'weak';
            if (score <= 8) return 'medium';
            return 'strong';
        }
    }

    // Add this to your settings.js file, in the document ready function
    // Find the Payment Preferences section
    const paymentPrefsSection = document.querySelector('.settings-section:nth-of-type(2)');
    if (paymentPrefsSection) {
        // Get the save button for this section
        const saveButton = paymentPrefsSection.querySelector('.settings-save-btn');
        
        // Add a click event that explains why changes can't be saved
        saveButton.addEventListener('click', function(e) {
            if (this.disabled) {
                e.preventDefault();
                
                // Create a temporary info message
                const infoMsg = document.createElement('div');
                infoMsg.className = 'settings-info-message';
                infoMsg.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    <span>Fee settings cannot be changed during the beta period.</span>
                `;
                
                // Add to the page near the button
                this.parentNode.appendChild(infoMsg);
                
                // Remove after 3 seconds
                setTimeout(() => {
                    infoMsg.classList.add('fade-out');
                    setTimeout(() => {
                        this.parentNode.removeChild(infoMsg);
                    }, 300);
                }, 3000);
            }
        });
    }
    
    function saveNotificationSettings() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const newPaymentNotify = document.getElementById('new-payment-notify').checked;
        const weeklySummary = document.getElementById('weekly-summary').checked;
        console.log('Saving notification settings:', newPaymentNotify, weeklySummary);
        fetch(`${API_URL}/api/setVendorConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                vendorID,
                paymentNotification: newPaymentNotify,
                summaryNotification: weeklySummary
            })
        })
        .then(response => {
            if (!response.ok) {
                showSaveError('Failed to save Notification Settings');
                throw new Error('Failed to update notification settings');
            }
            return response.json();
        })
        .then(data => {
            console.log('Notification settings updated:', data);
            showSaveSuccess('Notification Settings saved successfully!');
        })
        .catch(error => {
            console.error('Error updating notification settings:', error);
        });
    }

    function saveAccountSettings() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const emailInput = document.getElementById('email');
        const currentPasswordInput = document.getElementById('current-password');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        // Prepare data object
        const data = {
            vendorID,
            email: emailInput ? emailInput.value : null
        };
        
        // Check if user wants to update password
        if (newPasswordInput && newPasswordInput.value && 
            confirmPasswordInput && confirmPasswordInput.value && 
            currentPasswordInput && currentPasswordInput.value) {
            
            // Add password change data
            data.currentPassword = currentPasswordInput.value;
            data.newPassword = newPasswordInput.value;
        }
        
        console.log('Saving account settings:', data);
        
        fetch(`${API_URL}/api/setVendorConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 401) {
                    showSaveError('Current password is incorrect');
                    throw new Error('Current password is incorrect');
                }
                showSaveError('Failed to save Account Settings');
                throw new Error('Failed to update account settings');
            }
            return response.json();
        })
        .then(data => {
            console.log('Account settings updated:', data);
            showSaveSuccess('Account Settings saved successfully!'); // Fixed the message here too
            
            // Reset all password UI elements
            resetPasswordUI();
            
            // Reset password UI elements
            const changePasswordContainer = document.getElementById('change-password-container');
            if (changePasswordContainer) {
                changePasswordContainer.classList.add('hidden');
            }
            
            const togglePasswordLink = document.querySelector('.toggle-password-link');
            if (togglePasswordLink) {
                const icon = togglePasswordLink.querySelector('i');
                if (icon) icon.className = 'fas fa-lock';
            }
        })
        .catch(error => {
            console.error('Error updating account settings:', error);
            
            // Show error message to user
            const errorMsg = document.createElement('div');
            errorMsg.className = 'settings-error-message';
            errorMsg.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>${error.message}</span>
            `;
            
            // Add error message near the save button
            const saveButton = document.querySelector('.settings-section:has(h4:contains("Account Settings")) .settings-save-btn');
            if (saveButton && saveButton.parentNode) {
                saveButton.parentNode.appendChild(errorMsg);
                
                // Remove error after 5 seconds
                setTimeout(() => {
                    errorMsg.remove();
                }, 5000);
            }
        });
    }

    // Also make sure the password fields trigger the check when they change
    const passwordFields = document.querySelectorAll('#current-password, #new-password, #confirm-password');
    passwordFields.forEach(field => {
        field.addEventListener('input', function() {
            // Find the containing section and trigger its change check
            const section = this.closest('.settings-section');
            if (section) {
                const event = new Event('input', {
                    bubbles: true,
                    cancelable: true
                });
                // Trigger the check by simulating input on the email field
                const emailField = section.querySelector('#email');
                if (emailField) emailField.dispatchEvent(event);
            }
        });
    });

    // Add this function after your checkPasswordMatch function

    // Function to reset all password UI elements
    function resetPasswordUI() {
        // Reset password fields
        const currentPasswordInput = document.getElementById('current-password');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
        
        // Reset strength meter
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        const strengthMeter = document.querySelector('.password-strength-meter');
        
        if (strengthMeter) strengthMeter.className = 'password-strength-meter';
        if (strengthText) strengthText.textContent = 'Password strength';
        if (strengthBar) strengthBar.style.width = '0';
        
        // Reset match indicators
        const matchIndicator = document.querySelector('.password-match-indicator');
        const mismatchIndicator = document.querySelector('.password-mismatch-indicator');
        
        if (matchIndicator) matchIndicator.classList.add('hidden');
        if (mismatchIndicator) mismatchIndicator.classList.add('hidden');
        
        // Reset requirement indicators
        const lengthReq = document.querySelector('.req-length');
        if (lengthReq) lengthReq.classList.remove('valid');
    }

    // Webhook secret generation functionality
    const generateWebhookSecretBtn = document.getElementById('generate-webhook-secret');
    const webhookSecretDisplay = document.getElementById('webhook-secret-display');
    const webhookSecretInput = document.getElementById('webhook-secret');
    const copyWebhookSecretBtn = document.getElementById('copy-webhook-secret');

    if (generateWebhookSecretBtn) {
        generateWebhookSecretBtn.addEventListener('click', generateWebhookSecret);
    }

    function generateWebhookSecret() {
        // Get auth token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Show loading state
        generateWebhookSecretBtn.disabled = true;
        generateWebhookSecretBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        // Make API call to generate webhook secret
        fetch(`${API_URL}/api/generateWebhookSecret`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ vendorID })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to generate webhook secret');
            }
            return response.json();
        })
        .then(data => {
            // Reset button state
            generateWebhookSecretBtn.disabled = false;
            generateWebhookSecretBtn.innerHTML = '<i class="fas fa-key"></i> Generate New Webhook Secret';
            
            // Display the secret
            if (data.webhookSecret) {
                webhookSecretInput.value = data.webhookSecret;
                copyWebhookSecretBtn.setAttribute('data-clipboard', data.webhookSecret);
                webhookSecretDisplay.classList.remove('hidden');
                
                // Focus on the input to draw attention
                webhookSecretInput.focus();
                webhookSecretInput.select();
                
                // Auto-hide the secret after 1 minute
                setTimeout(() => {
                    if (!webhookSecretDisplay.classList.contains('hidden')) {
                        webhookSecretDisplay.classList.add('hidden');
                        webhookSecretInput.value = '';
                        showSaveSuccess('Webhook secret hidden for security reasons');
                    }
                }, 1 * 60 * 1000);
            }
        })
        .catch(error => {
            console.error('Error generating webhook secret:', error);
            generateWebhookSecretBtn.disabled = false;
            generateWebhookSecretBtn.innerHTML = '<i class="fas fa-key"></i> Generate New Webhook Secret';
            showSaveError('Failed to generate webhook secret');
        });
    }
});