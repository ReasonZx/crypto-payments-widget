document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 5;
    
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const guideContainer = document.querySelector('.guide-container');
    const widgetContainer = document.getElementById('final-widget-container');
    const useDefaultAll = document.getElementById('use-default-all');
    const walletInputs = document.querySelectorAll('.wallet-input');

    useDefaultAll.addEventListener('change', (e) => {
        walletInputs.forEach(input => {
            input.disabled = e.target.checked;
            if (e.target.checked) {
                input.value = '';
            }
        });
    });

    // Add chain toggle handlers
    document.querySelectorAll('.chain-toggle').forEach(toggle => {
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

    function getWalletsConfig() {
        const useDefaultWallet = document.getElementById('use-default-all').checked;
        const wallets = {};
        
        document.querySelectorAll('.chain').forEach(chain => {
            const chainToggle = chain.querySelector('.chain-toggle');
            if (chainToggle.checked) {
                const chainType = chain.querySelector('.chain-logo').alt.toLowerCase();
                const walletInput = chain.querySelector('.wallet-input');
                wallets[chainType] = useDefaultWallet ? null : walletInput.value.trim() || null;
            }
        });
        
        return wallets;
    }

    function validateChainWallets() {
        const useDefaultWallet = document.getElementById('use-default-all').checked;
        const chains = document.querySelectorAll('.chain');
        let selectedChains = 0;
        let isValid = true;
    
        chains.forEach(chain => {
            const chainToggle = chain.querySelector('.chain-toggle');
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
        const wallets = getWalletsConfig();
        const userID = 'demo-user-123'; // Or get from input if needed
        
        document.getElementById('codeAmount').textContent = amount;
        document.getElementById('codeWallets').textContent = JSON.stringify(wallets);
        document.getElementById('codeUserID').textContent = `'${userID}'`;
    }

        
    function showFinalWidget() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        const guideContainer = document.querySelector('.guide-container');
        const widgetContainer = document.getElementById('final-widget-container');
        const vendorLabel = document.querySelector('.vendor-label');
        const payerLabel = document.querySelector('.payer-label');    
        const amount = getAmount();
        const wallets = getWalletsConfig();
    
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
                
                const widget = new PaymentWidget({
                    amount: amount,
                    wallets: wallets,
                    container: widgetContainer,
                    userID: 'demo-user-123',
                });
            }, 200);
        }, 1800);
        console.log(wallets)
    }
    
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
});