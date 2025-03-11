document.addEventListener('DOMContentLoaded', async () => {
    const useDefaultAll = document.getElementById('use-default-all');
    const walletInputs = document.querySelectorAll('.wallet-input');
    const globalDefaultBox = document.querySelector('.global-default');
    const saveButton = document.getElementById('save-wallet-config');
    const chainToggles = document.querySelectorAll('.wallet-chain-toggle');
    let isConfigured = false;

    // Store initial state
    const initialState = {
        useDefaultAll: useDefaultAll.checked,
        chainToggles: Array.from(chainToggles).map(toggle => toggle.checked),
        walletInputs: Array.from(walletInputs).map(input => input.value)
    };

    // Fetch initial configuration from server
    async function getInitialConfig() {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('userData'));
            const userId = user ? user.id : null;
            const response = await fetch(`${API_URL}/api/getVendorWalletConfig`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        vendorID: userId,
                    })
                });

            if (!response.ok) {
                throw new Error('Failed to fetch configuration');
            }
            let data = await response.json();
            console.log('Fetched vendor configuration:', data);
            return data;
        }
        catch (error) {
            console.error('Error fetching vendor configuration:', error);
            return null;
        }
    }

    // Apply configuration to UI
    async function applyConfiguration() {
        const config = await getInitialConfig();
        if (!config) return;

        // Apply use default setting
        useDefaultAll.checked = config.useDefaultAll;
        if (config.useDefaultAll) {
            globalDefaultBox.classList.add('active');
        }

        // Apply chain toggles and wallet addresses
        chainToggles.forEach((toggle, index) => {
            if (config.chains && config.chains[index]) {
                toggle.checked = config.chains[index].enabled;
                const chain = toggle.closest('.chain');
                const walletInput = chain.querySelector('.wallet-input');
                
                if (walletInput) {
                    walletInput.value = config.chains[index].walletAddress || '';
                    walletInput.disabled = config.useDefaultAll || !config.chains[index].enabled;
                }
                
                if (!config.chains[index].enabled) {
                    chain.classList.add('chain-disabled');
                }
            }
        });

        // Store initial state after configuration is applied
        initialState.useDefaultAll = useDefaultAll.checked;
        initialState.chainToggles = Array.from(chainToggles).map(toggle => toggle.checked);
        initialState.walletInputs = Array.from(walletInputs).map(input => input.value);
        
        isConfigured = true;
    }

    // await applyConfiguration();

    function checkStateChanged() {
        // Create or get error message element
        let errorMsg = document.querySelector('.wallet-error-message');

        // Check if at least one chain is toggled
        const activeChains = Array.from(chainToggles).filter(toggle => toggle.checked);
        if (activeChains.length === 0) {
            errorMsg.textContent = "At least one chain must be used";
            errorMsg.style.display = 'block';
            saveButton.disabled = true;
            return;
        }

        // Check if all active chains have wallet addresses when not using custodial wallet
        if (!useDefaultAll.checked) {
            const missingAddresses = [];
            
            chainToggles.forEach((toggle, index) => {
                if (toggle.checked) {
                    const chain = toggle.closest('.chain');
                    const walletInput = chain.querySelector('.wallet-input');
                    const chainLogoImg = chain.querySelector('.chain-logo');
                    
                    if (!walletInput.value.trim()) {
                        const chainName = chainLogoImg ? chainLogoImg.alt.charAt(0).toUpperCase() + chainLogoImg.alt.slice(1) : `Chain ${index+1}`;
                        missingAddresses.push(chainName);
                    }
                }
            });
            
            if (missingAddresses.length > 0) {
                errorMsg.textContent = `Please enter wallet addresses for: ${missingAddresses.join(', ')}`;
                errorMsg.style.display = 'block';
                saveButton.disabled = true;
                return;
            }
        }

        // If we reach here, there are no validation errors
        errorMsg.style.display = 'none';
        
        // Check if state has changed from initial
        const currentState = {
            useDefaultAll: useDefaultAll.checked,
            chainToggles: Array.from(chainToggles).map(toggle => toggle.checked),
            walletInputs: Array.from(walletInputs).map(input => input.value)
        };

        const hasChanges =
            initialState.useDefaultAll !== currentState.useDefaultAll ||
            JSON.stringify(initialState.chainToggles) !== JSON.stringify(currentState.chainToggles) ||
            JSON.stringify(initialState.walletInputs) !== JSON.stringify(currentState.walletInputs);

        saveButton.disabled = !hasChanges;
    }

    // Initial state setup
    if (useDefaultAll.checked) {
        globalDefaultBox.classList.add('active');
    }

    useDefaultAll.addEventListener('change', (e) => {
        walletInputs.forEach(input => {
            input.disabled = e.target.checked;
            if (e.target.checked) {
                input.value = '';
            }
        });

        if (e.target.checked) {
            globalDefaultBox.classList.add('active');
        } else {
            globalDefaultBox.classList.remove('active');
        }
        
        checkStateChanged();
    });

    document.querySelectorAll('.wallet-chain-toggle').forEach(toggle => {
        toggle.addEventListener('change', function() {
            // Add this check to ensure we're only handling toggles in the Wallets tab
            if (!this.closest('#wallets')) {
                return; // Exit if toggle is not inside the Wallets tab
            }
            
            const walletInput = this.closest('.chain').querySelector('.wallet-input');
            const chain = this.closest('.chain');
            
            if (!this.checked) {
                walletInput.disabled = true;
                chain.classList.add('chain-disabled');
            } else {
                walletInput.disabled = useDefaultAll.checked;
                chain.classList.remove('chain-disabled');
            }
            
            checkStateChanged();
        });
    });

    walletInputs.forEach(input => {
        input.addEventListener('input', checkStateChanged);
    });

    saveButton.addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('userData'));
            const userId = user ? user.id : null;

            // Create wallets array
            const wallets = Array.from(chainToggles).map((toggle, index) => {
                const chain = toggle.closest('.chain');
                const chainLogoImg = chain.querySelector('.chain-logo');
    
                // Get chain name from the alt attribute of the logo image
                const chainName = chainLogoImg.alt.toLowerCase() ;

                const walletInput = chain.querySelector('.wallet-input');
                
                return {
                    chain: chainName,
                    address: walletInput.value,
                    active: toggle.checked
                };
            });

            console.log('Saving wallet configuration:', wallets);
            
            const response = await fetch(`${API_URL}/api/setVendorWalletConfig`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        vendorID: userId,
                        isCustodial: useDefaultAll.checked,
                        wallets: wallets,
                    })
                });

            if (!response.ok) {
                throw new Error('Failed to save configuration');
            }
            
            // Update initial state after successful save
            initialState.useDefaultAll = useDefaultAll.checked;
            initialState.chainToggles = Array.from(chainToggles).map(toggle => toggle.checked);
            initialState.walletInputs = Array.from(walletInputs).map(input => input.value);
            
            saveButton.disabled = true;
        } catch (error) {
            console.error('Failed to save wallet configuration:', error);
        }
    });

    // Listen for tab changes
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', async () => {
            if (item.getAttribute('data-tab') === 'wallets' && !isConfigured) {
                await applyConfiguration();
                checkStateChanged();
            }
        });
    });

    // Check if wallets tab is active on initial load
    const walletsTab = document.querySelector('.sidebar-item[data-tab="wallets"]');
    if (walletsTab && walletsTab.classList.contains('active')) {
        await applyConfiguration();
        checkStateChanged();
    }
});