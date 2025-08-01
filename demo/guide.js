document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 5;
    
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const useDefaultAll = document.getElementById('use-default-all');
    const walletInputs = document.querySelectorAll('.wallet-input');
    

    /*** Demo State Machine ***/
    function updateSteps() {
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        document.querySelectorAll('.progress-bar .step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= currentStep);
        });

        if (currentStep === 2 && !validateChainWallets()) {
            currentStep--;
            return;
        }
    
        if (currentStep === 3 && !validateAmount()) {
            currentStep--;
            return;
        }

        if (currentStep === 5) {
            updateCodeBlock();
        }
        
        prevBtn.disabled = currentStep === 1;
        nextBtn.textContent = currentStep === totalSteps ? 'Client UI' : 'Next';
    }


    /*** Call widget (Client View) ***/
    function showFinalWidget() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        const guideContainer = document.querySelector('.guide-container');
        const widgetContainer = document.getElementById('final-widget-container');
        const vendorLabel = document.querySelector('.vendor-label');
        const payerLabel = document.querySelector('.payer-label');    
        const useDefaultAll = document.getElementById('use-default-all');
        const amount = getAmount();
        const currency = getSelectedCurrency();
        const wallets = getWalletsConfig();
        const isUsingDefaultWallet = useDefaultAll.checked;
    
        loadingOverlay.classList.add('show');
        guideContainer.style.display = 'none';
        vendorLabel.style.display = 'none';

    
        setTimeout(() => {
            loadingOverlay.classList.add('fade-out');
            
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
                loadingOverlay.classList.remove('fade-out');
                widgetContainer.style.display = 'block';
                payerLabel.style.display = 'flex';

                let widgetConfig = {
                    type: 'standAlonePayment',
                    amount: amount,
                    currency: currency,
                    vendorID: 'demo_vendor_123',
                    isCustodial: isUsingDefaultWallet,
                    container: widgetContainer,
                    userID: 'demo-user-123'
                };

                if (isUsingDefaultWallet) {
                    const chains = getChainsConfig();
                    widgetConfig.chains = chains;
                } else {
                    widgetConfig.wallets = wallets;
                }
                
                const widget = new PaymentWidget(widgetConfig);

            }, 200);
        }, 1800);
    }


    /*** Listeners ***/
    useDefaultAll.addEventListener('change', (e) => {
        walletInputs.forEach(input => {
            input.disabled = e.target.checked;
            if (e.target.checked) {
                input.value = '';
            }
        });
    });

    document.querySelectorAll('.demo-chain-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const chain = e.target.closest('.chain');
            const walletInput = chain.querySelector('.wallet-input');
            
            if (!e.target.checked) {
                walletInput.disabled = true;
                chain.classList.add('chain-disabled');
            } else {
                walletInput.disabled = useDefaultAll.checked;
                chain.classList.remove('chain-disabled');
            }
        });
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            if (currentStep === 2 && !validateChainWallets()) return;
            if (currentStep === 3 && !validateAmount()) return;
            
            currentStep++;
            updateSteps();
        } else {
            showFinalWidget();
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateSteps();
        }
    });

    /*** Helper functions ***/

    function getWalletsConfig() {
        const useDefaultWallet = document.getElementById('use-default-all').checked;
        const wallets = [];
        
        document.querySelectorAll('.chain').forEach(chain => {
            const chainToggle = chain.querySelector('.demo-chain-toggle');
            if (chainToggle.checked) {
                const chainType = chain.querySelector('.chain-logo').alt.toLowerCase();
                const walletInput = chain.querySelector('.wallet-input');
                const chainAddress = useDefaultWallet ? null : walletInput.value.trim() || null;
                
                wallets.push({
                    chain: chainType,
                    chainAddress: chainAddress
                });
            }
        });
        
        return wallets;
    }

    function getChainsConfig() {
        const chains = [];
        
        document.querySelectorAll('.chain').forEach(chain => {
            const chainToggle = chain.querySelector('.demo-chain-toggle');
            if (chainToggle.checked) {
                const chainType = chain.querySelector('.chain-logo').alt.toLowerCase();
                chains.push(chainType);
            }
        });
        
        return chains;
    }

    function validateChainWallets() {
        const useDefaultWallet = document.getElementById('use-default-all').checked;
        const chains = document.querySelectorAll('.chain');
        let selectedChains = 0;
        let isValid = true;
    
        chains.forEach(chain => {
            const chainToggle = chain.querySelector('.demo-chain-toggle');
            if (chainToggle.checked) {
                selectedChains++;
                const walletInput = chain.querySelector('.wallet-input');
                if (!useDefaultWallet && !walletInput.value.trim()) {
                    walletInput.classList.add('error');
                    isValid = false;
                } else {
                    walletInput.classList.remove('error');
                }
            }
        });
    
        if (selectedChains === 0) {
            alert('Please select at least one chain to proceed');
            return false;
        }
    
        if (!isValid) {
            alert('Please enter wallet addresses for all selected chains or use default custodian wallet');
            return false;
        }
    
        return true;
    }

    function getAmount() {
        return parseFloat(document.querySelector('.amount-config input[type="number"]').value);
    }

    function getSelectedCurrency() {
        return document.getElementById('currency-value').value;
    }

    function validateAmount() {
        const amountInput = document.querySelector('.amount-config input[type="number"]');
        const amount = parseFloat(amountInput.value);
        
        if (!amount || amount <= 0) {
            amountInput.classList.add('error');
            alert('Please enter an amount greater than 0');
            return false;
        }
        
        amountInput.classList.remove('error');
        return true;
    }

    function updateCodeBlock() {
        const amount = getAmount();
        const currency = getSelectedCurrency();
        const wallets = getWalletsConfig();
        const chains = getChainsConfig();
        const userID = 'demo-user-123';
        const useDefaultAll = document.getElementById('use-default-all');
        const isCustodial = useDefaultAll.checked;

        // Create code block HTML
        const codeBlockHTML = `
        <div class="code-block">
            <pre><code>&lt;head&gt;
    &lt;script src="https://cdn.jsdelivr.net/gh/ReasonZx/crypto-payments-widget@2.3.0/dist/crypto-payments-widget.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="payment-container"&gt;&lt;/div&gt;
    &lt;script&gt;
        const widget = new PaymentWidget({
            type: 'standAlonePayment',
            vendorID: 'demo_vendor_123',
            amount: <span class="highlight" id="codeAmount">${amount}</span>,
            currency: <span class="highlight" id="codeCurrency">'${currency}'</span>,
            isCustodial: <span class="highlight" id="codeCustodial">${isCustodial}</span>,
            ${!isCustodial ? 
                `wallets: <span class="highlight" id="codeWallets">${JSON.stringify(wallets)}</span>,\n            ` : 
                `chains: <span class="highlight" id="codeChains">${JSON.stringify(chains)}</span>,\n            `}userID: '${userID}'
        });
    &lt;/script&gt;
&lt;/body&gt;</code></pre>
        </div>`;

        // Find the step5 content and add the code block after the paragraph
        const step5 = document.getElementById('step5');
        const existingCodeBlock = step5.querySelector('.code-block');
        if (existingCodeBlock) {
            existingCodeBlock.remove();
        }
        step5.querySelector('p').insertAdjacentHTML('afterend', codeBlockHTML);
    }

    // Mobile-specific enhancements
    // Improve scrolling between steps on mobile
    function scrollToTopOfGuide() {
        if (window.innerWidth <= 768) {
            const guideContainer = document.querySelector('.guide-container');
            if (guideContainer) {
                guideContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    
    // Attach to navigation buttons
    document.getElementById('nextBtn').addEventListener('click', scrollToTopOfGuide);
    document.getElementById('prevBtn').addEventListener('click', scrollToTopOfGuide);
    
    // Add active step scrolling for progress bar
    function scrollActiveStepIntoView() {
        if (window.innerWidth <= 480) {
            const activeStep = document.querySelector('.progress-bar .step.active');
            if (activeStep) {
                activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }
    
    // Update original updateSteps function to include progress bar scrolling
    const originalUpdateSteps = updateSteps;
    window.updateSteps = function() {
        originalUpdateSteps();
        setTimeout(scrollActiveStepIntoView, 100);
    };
    
    // Fix input focus issues on mobile
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Add delay to account for keyboard appearing
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
    
    // Add event listeners for currency selection
    document.querySelectorAll('input[name="currency"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (currentStep === 5) {
                updateCodeBlock();
            }
        });
    });

    // Add currency dropdown functionality
    const currencyDropdown = document.querySelector('.currency-dropdown');
    const selectedCurrency = document.getElementById('selected-currency');
    const currencyOptions = document.querySelectorAll('.currency-option');
    const currencyValue = document.getElementById('currency-value');
    
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
                
                const value = this.getAttribute('data-value');
                selectedCurrency.textContent = value;
                currencyValue.value = value;
                currencyDropdown.classList.remove('active');
                
                // If you're on step 5, update the code block
                if (currentStep === 5) {
                    updateCodeBlock();
                }
            });
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', function() {
            currencyDropdown.classList.remove('active');
        });
    }

});