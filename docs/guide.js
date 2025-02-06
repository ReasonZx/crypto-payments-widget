document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 4;
    
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const guideContainer = document.querySelector('.guide-container');
    const widgetContainer = document.getElementById('final-widget-container');

        // Add chain toggle handlers
    document.querySelectorAll('.chain-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const chain = e.target.closest('.chain');
            const custodianCheckbox = chain.querySelector('.use-default');
            const walletInput = chain.querySelector('.wallet-input');
            
            if (!e.target.checked) {
                // Chain disabled - disable everything
                custodianCheckbox.disabled = true;
                walletInput.disabled = true;
                chain.classList.add('chain-disabled');
            } else {
                // Chain enabled - restore normal state
                custodianCheckbox.disabled = false;
                walletInput.disabled = custodianCheckbox.checked;
                chain.classList.remove('chain-disabled');
            }
        });
    });

    // Add wallet input handlers
    document.querySelectorAll('.use-default').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const walletInput = e.target.closest('.wallet-input-group').querySelector('.wallet-input');
            walletInput.disabled = e.target.checked;
            if (e.target.checked) {
                walletInput.value = '';
            }
        });
    });

    // Initialize wallet inputs based on default checkbox state
    document.querySelectorAll('.use-default').forEach(checkbox => {
        const walletInput = checkbox.closest('.wallet-input-group').querySelector('.wallet-input');
        walletInput.disabled = checkbox.checked;
    });
    
    function updateSteps() {
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        document.querySelectorAll('.progress-bar .step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= currentStep);
        });
        
        prevBtn.disabled = currentStep === 1;
        nextBtn.textContent = currentStep === totalSteps ? 'Client UI' : 'Next';
    }
    
    function showFinalWidget() {
        guideContainer.style.display = 'none';
        widgetContainer.style.display = 'block';
        
        const widget = new PaymentWidget({
            amount: 5,
            container: widgetContainer,
            serverUrl: 'https://crypto-payments-backend-90e8ca11c89f.herokuapp.com/',
            wsUrl: 'wss://crypto-payments-backend-90e8ca11c89f.herokuapp.com'
        });
    }

    function validateChainSelection() {
        if (currentStep === 2) {
            const selectedChains = document.querySelectorAll('.chain-toggle:checked');
            if (selectedChains.length === 0) {
                alert('Please select at least one chain to proceed');
                return false;
            }
        }
        return true;
    }
    
    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            if (validateChainSelection()) {
                currentStep++;
                updateSteps();
            }
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