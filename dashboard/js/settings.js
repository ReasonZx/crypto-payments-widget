//todo - implement interatcion with backend Settings page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Track original values of inputs to detect changes
    const originalValues = {};
    
    // Get all sections
    const sections = document.querySelectorAll('.settings-section');
    
    // For each section, store original values and add change listeners
    sections.forEach(section => {
        const sectionId = section.querySelector('h4').textContent;
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
            
            // Show success message
            showSaveSuccess(sectionTitle);
            
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
            
            // In a real app, you would save the settings to the server here
            // saveSettingsToServer(section);
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
    function showSaveSuccess(sectionName) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'settings-toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="toast-content">
                <p>${sectionName} saved successfully!</p>
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
            const strength = checkPasswordStrength(password);
            
            // Update strength meter
            strengthMeter.className = 'password-strength-meter';
            
            if (password.length === 0) {
                strengthBar.style.width = '0';
                strengthText.textContent = 'Password strength';
            } else if (strength === 'weak') {
                strengthMeter.classList.add('strength-weak');
                strengthText.textContent = 'Weak';
            } else if (strength === 'medium') {
                strengthMeter.classList.add('strength-medium');
                strengthText.textContent = 'Medium';
            } else {
                strengthMeter.classList.add('strength-strong');
                strengthText.textContent = 'Strong';
            }
            
            // Check requirements
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
        
        // Check password requirements
        function checkPasswordRequirements(password) {
            const requirements = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password)
            };
            
            // Update requirement indicators
            document.querySelector('.req-length').classList.toggle('valid', requirements.length);
            document.querySelector('.req-uppercase').classList.toggle('valid', requirements.uppercase);
            document.querySelector('.req-lowercase').classList.toggle('valid', requirements.lowercase);
            document.querySelector('.req-number').classList.toggle('valid', requirements.number);
            document.querySelector('.req-special').classList.toggle('valid', requirements.special);
            
            return requirements;
        }
        
        // Function to check password strength
        function checkPasswordStrength(password) {
            if (password.length === 0) return '';
            
            const requirements = checkPasswordRequirements(password);
            const passedRequirements = Object.values(requirements).filter(Boolean).length;
            
            if (passedRequirements <= 2) return 'weak';
            if (passedRequirements <= 4) return 'medium';
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
});