document.addEventListener('DOMContentLoaded', () => {
    const posButtons = document.querySelectorAll('.pos-button:not([disabled])');
    const checkoutModal = document.getElementById('checkout-modal');
    const paylinkModal = document.getElementById('paylink-modal');
    
    // Close button functionality for both modals
    const closeModalBtns = document.querySelectorAll('.modal-close-btn');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
            paylinkModal.classList.remove('active');
            document.body.style.overflow = ''; // Re-enable scrolling
        });
    });
    
    // Variables for Web Checkout modal
    const checkoutNextBtn = checkoutModal.querySelector('.next-btn');
    const checkoutPrevBtn = checkoutModal.querySelector('.prev-btn');
    const checkoutSteps = checkoutModal.querySelectorAll('.walkthrough-stepper .step');
    const checkoutPanels = checkoutModal.querySelectorAll('.step-panel');
    
    // Variables for Pay by Link modal
    const paylinkNextBtn = paylinkModal.querySelector('.next-btn');
    const paylinkPrevBtn = paylinkModal.querySelector('.prev-btn');
    const paylinkSteps = paylinkModal.querySelectorAll('.walkthrough-stepper .step');
    const paylinkPanels = paylinkModal.querySelectorAll('.step-panel');
    
    let currentCheckoutStep = 1;
    let currentPaylinkStep = 1;
    
    // Open modal when clicking on specific POS button
    posButtons.forEach(button => {
        button.addEventListener('click', function() {
            const posType = this.parentElement.querySelector('h4').textContent;
            
            if (posType === 'Web Checkout') {
                // Reset to first step for Web Checkout
                currentCheckoutStep = 1;
                updateStepUI(checkoutSteps, checkoutPanels, checkoutPrevBtn, checkoutNextBtn, currentCheckoutStep);
                
                // Open Web Checkout modal
                checkoutModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
            } 
            else if (posType === 'Pay by Link') {
                // Reset to first step for Pay by Link
                currentPaylinkStep = 1;
                updateStepUI(paylinkSteps, paylinkPanels, paylinkPrevBtn, paylinkNextBtn, currentPaylinkStep);
                
                // Open Pay by Link modal
                paylinkModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
                
                // Fetch payment links when opening the modal
                fetchAndDisplayPaymentLinks();
            }
            else {
                alert(`You clicked on ${posType}. Setup will be implemented soon.`);
            }
        });
    });
    
    // Close modal function
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    // Close modals when clicking outside
    [checkoutModal, paylinkModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Update the UI based on current step
    function updateStepUI(steps, panels, prevBtn, nextBtn, currentStep) {
        // Update stepper
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Update panels
        panels.forEach(panel => {
            panel.classList.remove('active');
            if (parseInt(panel.dataset.step) === currentStep) {
                panel.classList.add('active');
            }
        });
        
        // Update navigation buttons
        prevBtn.disabled = currentStep === 1;

        const isPaylink = nextBtn === paylinkNextBtn;

        
        // Set button text based on current step
        if (currentStep === 5) {
            nextBtn.textContent = 'Finish';
        } else if (currentStep === 4 && isPaylink) {
            nextBtn.textContent = 'Create Link';
        } else {
            nextBtn.textContent = 'Next';
        }
    }
    
    // Web Checkout Next button click
    checkoutNextBtn.addEventListener('click', () => {
        if (currentCheckoutStep < 5) {
            currentCheckoutStep++;
            updateStepUI(checkoutSteps, checkoutPanels, checkoutPrevBtn, checkoutNextBtn, currentCheckoutStep);
        } else {
            closeModal(checkoutModal);
        }
    });
    
    // Web Checkout Previous button click
    checkoutPrevBtn.addEventListener('click', () => {
        if (currentCheckoutStep > 1) {
            currentCheckoutStep--;
            updateStepUI(checkoutSteps, checkoutPanels, checkoutPrevBtn, checkoutNextBtn, currentCheckoutStep);
        }
    });
    
    // Pay by Link Next button click
    paylinkNextBtn.addEventListener('click', async () => {
        if (currentPaylinkStep < 5) {
            currentPaylinkStep++;
            
            // If moving to step 4, update confirmation details
            if (currentPaylinkStep === 4) {
                updateConfirmationDetails();
            }
            // If moving to step 5, generate payment link
            else if (currentPaylinkStep === 5) {
                await generatePaymentLink();
            }
            
            updateStepUI(paylinkSteps, paylinkPanels, paylinkPrevBtn, paylinkNextBtn, currentPaylinkStep);
        } else {
            closeModal(paylinkModal);
        }
    });
    
    // Pay by Link Previous button click
    paylinkPrevBtn.addEventListener('click', () => {
        if (currentPaylinkStep > 1) {
            currentPaylinkStep--;
            updateStepUI(paylinkSteps, paylinkPanels, paylinkPrevBtn, paylinkNextBtn, currentPaylinkStep);
        }
    });
    
    // Create New Link button click
    const createNewLinkBtn = document.getElementById('create-new-link-btn');
    if (createNewLinkBtn) {
        createNewLinkBtn.addEventListener('click', () => {
            currentPaylinkStep = 2; // Go directly to step 2 (select chains)
            updateStepUI(paylinkSteps, paylinkPanels, paylinkPrevBtn, paylinkNextBtn, currentPaylinkStep);
        });
    }
    
    // Amount chip click handlers
    const amountChips = paylinkModal.querySelectorAll('.amount-chip');
    amountChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            document.getElementById('payment-amount').value = amount;
        });
    });
    
    // Copy payment link button
    const copyLinkBtn = paylinkModal.querySelector('.copy-payment-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            const linkInput = document.getElementById('payment-link-url');
            linkInput.select();
            document.execCommand('copy');
            
            // Visual feedback
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    }
    
    // Function to update confirmation details
    function updateConfirmationDetails() {
        // Get selected chains
        const selectedChains = [];
        const chainToggles = paylinkModal.querySelectorAll('.poss-chain-toggle');
        
        chainToggles.forEach(toggle => {
            if (toggle.checked && toggle.dataset.chain) {
                selectedChains.push(toggle.dataset.chain.charAt(0).toUpperCase() + toggle.dataset.chain.slice(1));
            }
        });
        
        // Get amount and currency
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const currencyDropdown = document.getElementById('currency-dropdown');
        const currency = currencyDropdown.getAttribute('data-selected-currency') || 'USD';
        const currencySymbol = currency === 'EUR' ? '€' : '$';
        
        // Calculate transaction fee (max of 0.30 or 0.5% of amount)
        const percentageFee = amount * 0.005;
        const fixedFee = 0.50;
        const actualFee = Math.max(percentageFee, fixedFee);
        const formattedFee = actualFee.toFixed(2);
        
        // Update confirmation panel
        document.getElementById('confirm-chains').textContent = selectedChains.join(', ');
        document.getElementById('confirm-amount').textContent = `${currencySymbol}${amount.toFixed(2)}`;
        
        // Update the fee display with calculated value
        const feeElement = paylinkModal.querySelector('.confirmation-row:nth-child(3) .confirmation-value');
        if (feeElement) {
            feeElement.textContent = `${currencySymbol}${formattedFee} (${percentageFee > fixedFee ? '0.5%' : 'fixed fee'})`;
        }
    }
    
    // Function to generate payment link
    async function generatePaymentLink() {
        // Show loading state
        const nextBtn = paylinkModal.querySelector('.next-btn');
        const originalText = nextBtn.textContent;
        nextBtn.textContent = 'Creating link...';
        nextBtn.disabled = true;
        
        // Get the payment data
        const amount = parseFloat(document.getElementById('payment-amount').value).toFixed(2);
        const currencyDropdown = document.getElementById('currency-dropdown');
        const currency = currencyDropdown.getAttribute('data-selected-currency') || 'USD';
        const selectedChains = [];
        const chainToggles = paylinkModal.querySelectorAll('.poss-chain-toggle');
        
        chainToggles.forEach(toggle => {
            if (toggle.checked && toggle.dataset.chain) {
                selectedChains.push(toggle.dataset.chain);
            }
        });
        
        // Get token from local storage (set during login)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const vendorID = userData.id;
        
        // Create the request payload
        const payload = {
            vendorID: vendorID,
            amount: parseFloat(amount),
            currency: currency,
            chains: selectedChains,
            userID: null
        };
        

        // Make the API call
        await fetch(`${API_URL}/api/setupPaymentID`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create payment link');
            }
            return response.json();
        })
        .then(data => {
            // Successfully created the payment link
            const linkURL = `https://pay.stablio.eu/link/${vendorID}/${data.paymentID}`;
            document.getElementById('payment-link-url').value = linkURL;
            
            // Enable button and restore text
            nextBtn.textContent = originalText;
            nextBtn.disabled = false;
            
            // Show success message
            showToast('Payment link created successfully!', 'success');
            
            // Fetch updated list of links to refresh the table
            fetchAndDisplayPaymentLinks();
        })
        .catch(error => {
            console.error('Error creating payment link:', error);
            
            // Enable button and restore text
            nextBtn.textContent = originalText;
            nextBtn.disabled = false;
            
            // Show error message
            showToast('Failed to create payment link. Please try again.', 'error');
        });
    }
    
    // Prevent keyboard navigation from affecting page when modal is open
    document.addEventListener('keydown', (e) => {
        if (checkoutModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeModal(checkoutModal);
            } else if (e.key === 'ArrowRight' && currentCheckoutStep < 5) {
                currentCheckoutStep++;
                updateStepUI(checkoutSteps, checkoutPanels, checkoutPrevBtn, checkoutNextBtn, currentCheckoutStep);
            } else if (e.key === 'ArrowLeft' && currentCheckoutStep > 1) {
                currentCheckoutStep--;
                updateStepUI(checkoutSteps, checkoutPanels, checkoutPrevBtn, checkoutNextBtn, currentCheckoutStep);
            }
        } else if (paylinkModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeModal(paylinkModal);
            } else if (e.key === 'ArrowRight' && currentPaylinkStep < 5) {
                currentPaylinkStep++;
                updateStepUI(paylinkSteps, paylinkPanels, paylinkPrevBtn, paylinkNextBtn, currentPaylinkStep);
            } else if (e.key === 'ArrowLeft' && currentPaylinkStep > 1) {
                currentPaylinkStep--;
                updateStepUI(paylinkSteps, paylinkPanels, paylinkPrevBtn, paylinkNextBtn, currentPaylinkStep);
            }
        }
    });

    // Add this function to fetch payment links from API
    function fetchAndDisplayPaymentLinks() {
        const linksTableBody = document.getElementById('payment-links-body');
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('userData'));
        const userId = user ? user.id : null;

        // Show loading state
        linksTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-links">
                    <div class="spinner"></div>
                    <p>Loading payment links...</p>
                </td>
            </tr>
        `;
        fetch(`${API_URL}/api/getPaymentByLinkIDs`, {
            method: 'POST',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vendorID: userId,
            })})
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch payment links');
                }
                return response.json();
            })
            .then(data => {
                // Clear loading indicator
                linksTableBody.innerHTML = '';
                
                // Check if we have any data
                if (!data || !data.paymentIDs || data.paymentIDs.length === 0) {
                    linksTableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="empty-links">
                                <i class="fas fa-link"></i>
                                <p>No payment links found. Create your first link!</p>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                // Sort the links by created_at date (newest first)
                data.paymentIDs.sort((a, b) => {
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                
                // Populate table with data - now sorted by newest first
                data.paymentIDs.forEach(link => {
                    // Format date
                    const date = new Date(link.created_at);
                    const formattedDate = `${date.toLocaleDateString('en-US', {
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric'
                    })}`;

                    // Create full detailed date for tooltip
                    const fullDate = date.toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short'
                    });

                    // Format chains
                    const supportedChains = link.supported_chains ? 
                    link.supported_chains.map(chain => chain.charAt(0).toUpperCase() + chain.slice(1)).join(', ') : 
                    'All chains';
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            ${link.payment_id}
                            <a href="#" class="copy-link-btn" data-link="https://pay.stablio.eu/link/${userId}/${link.payment_id}">
                                <i class="fas fa-copy"></i>
                            </a>
                        </td>
                        <td>${link.currency === 'EUR' ? '€' : '$'}${parseFloat(link.amount).toFixed(2)}</td>
                        <td data-full-date="${fullDate}">${formattedDate}</td>
                        <td>${supportedChains}</td>
                    `;
                    linksTableBody.appendChild(row);
                });
                
                // Add event listeners to new copy buttons
                attachCopyButtonListeners();
            })
            .catch(error => {
                console.error('Error fetching payment links:', error);
                linksTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="error-links">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Error loading payment links. Please try again.</p>
                        </td>
                    </tr>
                `;
            });
    }
    
    // Helper function to attach event listeners to copy buttons
    function attachCopyButtonListeners() {
        const copyButtons = document.querySelectorAll('#payment-links-body .copy-link-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const linkText = this.getAttribute('data-link');
                
                // Copy to clipboard
                const textarea = document.createElement('textarea');
                textarea.value = linkText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                // Visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            });
        });
    }

    // Add refresh button functionality
    const refreshLinksBtn = document.getElementById('refresh-links-btn');
    if (refreshLinksBtn) {
        refreshLinksBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.classList.add('fa-spin');
            
            fetchAndDisplayPaymentLinks();
            
            // Remove spinning after 1 second
            setTimeout(() => {
                icon.classList.remove('fa-spin');
            }, 1000);
        });
    }

    // Add CSS for toast notifications
    const style = document.createElement('style');
    style.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: white;
        color: #333;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 10000;
        max-width: 300px;
    }

    .toast.show {
        opacity: 1;
        transform: translateY(-10px);
    }

    .toast.success {
        border-left: 4px solid var(--primary-color);
    }

    .toast.error {
        border-left: 4px solid #e53e3e;
    }
    `;

    document.head.appendChild(style);

    // Add this toast notification function if not already present
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide and remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Mobile specific adjustments
    function setupMobileEnhancements() {
        // Adjust modal height on mobile
        function adjustModalHeight() {
            const modalContainers = document.querySelectorAll('.modal-container');
            const windowHeight = window.innerHeight;
            
            modalContainers.forEach(container => {
                // Set max height based on viewport
                if (window.innerWidth <= 768) {
                    container.style.maxHeight = `${windowHeight * 0.8}px`;
                } else {
                    container.style.maxHeight = '90vh';
                }
            });
        }
        
        // Call immediately and on resize
        adjustModalHeight();
        window.addEventListener('resize', adjustModalHeight);
        
        // Make tables scroll horizontally on mobile
        const tableContainers = document.querySelectorAll('.links-table-container');
        tableContainers.forEach(container => {
            container.addEventListener('touchstart', function(e) {
                // Only on mobile devices
                if (window.innerWidth <= 768) {
                    // Prevent vertical scroll while horizontally scrolling the table
                    if (this.scrollWidth > this.clientWidth) {
                        e.stopPropagation();
                    }
                }
            }, { passive: true });
        });
        
        // Improve focus for amount input on mobile
        const paymentAmount = document.getElementById('payment-amount');
        if (paymentAmount) {
            paymentAmount.addEventListener('focus', function() {
                // Scroll to make sure the input is visible when keyboard appears
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        }
    }

    // Call the setup function
    setupMobileEnhancements();

    // Initialize currency dropdown
    function initializeCurrencyDropdown() {
        const currencyDropdown = document.getElementById('currency-dropdown');
        const currencySymbol = document.getElementById('currency-symbol');
        const currencyOptions = document.querySelectorAll('.currency-option');
        
        if (currencyDropdown) {
            // Toggle dropdown
            currencyDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
            });
            
            // Select currency option
            currencyOptions.forEach(option => {
                option.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const currency = this.getAttribute('data-currency');
                    currencySymbol.textContent = currency === 'EUR' ? '€' : '$';
                    
                    // Update amount chips
                    const amountChips = paylinkModal.querySelectorAll('.amount-chip');
                    amountChips.forEach(chip => {
                        chip.setAttribute('data-currency', currency);
                        const amount = chip.getAttribute('data-amount');
                        chip.textContent = currency === 'EUR' ? `€${amount}` : `$${amount}`;
                    });
                    
                    // Close dropdown
                    currencyDropdown.classList.remove('active');
                    
                    // Store selected currency for later use in confirmation and API calls
                    currencyDropdown.setAttribute('data-selected-currency', currency);
                });
            });
            
            // Close dropdown when clicking elsewhere
            document.addEventListener('click', function() {
                currencyDropdown.classList.remove('active');
            });
        }
    }

    // Call the initializeCurrencyDropdown function
    initializeCurrencyDropdown();
});