import styles from './styles.css?inline'
import template from './template.html?raw'
import QRCode from 'qrcode';


/**
 * Mandatory fields according to each @param {string} config.type - payment type:
 * @param {string} config.type.defaultPayment:      amount, vendorID (optional - userID, chains)
 * @param {string} config.type.paymentById:         paymentID, vendorID (optional - userID)
 * @param {string} config.type.standAlonePayment:   amount, vendorID, isCustodial, (optional - userID)
 *                                                      wallets - if isCustodial is false, 
 *                                                      chains - if isCustodial is True, (optional - defaults to both chains)
 */
class PaymentWidget {
    constructor(config = {}) {
        this.config = {
            container: config.container || document.getElementById('payment-container'),
            serverUrl: config.serverUrl || 'https://crypto-payments-backend-90e8ca11c89f.herokuapp.com/',
            wsUrl: config.wsUrl || 'https://crypto-payments-backend-90e8ca11c89f.herokuapp.com/',
            paymentID: config.paymentID || null,
            amount: config.amount || null,
            currency: config.currency || 'USD',
            userID: config.userID || null,
            webhook: config.webhook || null,
            chains: config.chains,                          // ['solana', 'base'] | ['solana'] | ['base']
            vendorID: config.vendorID,
            isCustodial: config.isCustodial === undefined ? true : config.isCustodial,
            wallets: config.wallets || [],                 // [{chain: 'solana', chainAddress: 'address'}, {chain: 'base', chainAddress: 'address'}]
            type: config.type || 'defaultPayment',         // 'defaultPayment' | 'paymentById' | 'standAlonePayment'
        };
        this._authToken = null;
        this._publicKey = null;
        this.crypto = window.crypto;
        this.selectedValue = null;
        this.ws = null;
        this.lastHeartbeatTime = null;
        this.heartbeatMonitor = null;
        this.heartbeatWarningShown = false;

        switch (this.config.type) {
            case 'defaultPayment':
                if(!this.config.amount || !this.config.vendorID) {
                    throw new Error('Amount and Vendor ID are required for default payment');
                }
                break;
            case 'paymentById':
                if(!this.config.paymentID || !this.config.vendorID) {
                    throw new Error('Payment ID and Vendor ID are required for paymentById');
                }
                break;
            case 'standAlonePayment':
                if(!this.config.amount || !this.config.vendorID || (this.config.isCustodial === undefined) ) {
                    throw new Error('Amount, Vendor ID and isCustodial are required for standAlonePayment');
                }
                if(!this.config.isCustodial) {
                    if(this.config.wallets.length === 0){
                        throw new Error('"Wallets" field is required for non-custodial payment');
                    }
                    this.config.chains = this.config.wallets.map(w => w.chain);
                }
                else {
                    if(this.config.chains.length === 0){
                        throw new Error('"Chains" field is required for custodial payment');
                    }
                }
                break;
            default:
                throw new Error('Invalid payment type');
        }


        this.goToScreen1();
    }

    setupEventListeners() {
        // Get elements from shadow DOM
        const dropdown = this.shadow.querySelector('.dropdown');
        const select = this.shadow.querySelector('#customSelect');
        const options = this.shadow.querySelectorAll('.option');
        const selected = this.shadow.querySelector('.selected');
        const nextButton = this.shadow.querySelector('#nextButton');

        // Set number of options
        const numOptions = options.length;
        this.shadow.host.style.setProperty('--num-options', numOptions);

        // Toggle dropdown
        select.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // Handle option selection
        options.forEach(option => {
            option.addEventListener('click', () => {
                const optionMain = option.querySelector('.option-main').cloneNode(true);
                const optionTokens = option.querySelector('.option-tokens').cloneNode(true);
                this.selectedValue = option.dataset.value;
                
                if (nextButton) {
                    nextButton.classList.remove('disabled');
                    nextButton.disabled = false;
                }

                selected.innerHTML = '';
                selected.appendChild(optionMain);
                selected.appendChild(optionTokens);
                dropdown.classList.remove('open');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const isClickInside = dropdown.contains(e.target);
            if (!isClickInside) {
                dropdown.classList.remove('open');
            }
        });

        // Next button click
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                // Only proceed if button is not already in loading state
                if (!nextButton.classList.contains('loading') && !nextButton.disabled) {
                    this.goToScreen2();
                }
            });
        }
    }


    /***  Screen management ***/

    async goToScreen1() {
        try {
            
            const paymentChains = await this.fetchPaymentChains();

            // Validate at least one chain
            if (paymentChains.length === 0) {
                throw new Error('No payment chains available');
            }

            // Create shadow DOM
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'closed' });
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = styles;
            this.shadow.appendChild(style);
        
            // Create temporary container and add template
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = template;
            
            // Find and filter chain options
            const dropdownOptions = tempContainer.querySelector('.dropdown-options');

            // Filter chain options based on available chains from wallets
            const options = dropdownOptions.querySelectorAll('.option');
            options.forEach(option => {
                const chainType = option.getAttribute('data-value');
                if (!paymentChains.includes(chainType)) {
                    option.remove();
                }
            });
            
            // Handle currency-specific token icons
            const currencyLower = this.config.currency.toLowerCase();
            tempContainer.querySelectorAll(`.currency-usd, .currency-eur`).forEach(el => {
                el.classList.add('hidden');
            });
            tempContainer.querySelectorAll(`.currency-${currencyLower}`).forEach(el => {
                el.classList.remove('hidden');
            });
        
            // Update widget height variable based on remaining options
            const remainingOptions = dropdownOptions.querySelectorAll('.option').length;
            this.shadow.host.style.setProperty('--num-options', remainingOptions);
        
            // Add filtered content to shadow DOM
            this.shadow.appendChild(tempContainer.querySelector('.widget'));
            
            // Mount to container
            this.config.container.appendChild(this.container);
        
            // Initialize functionality
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize widget:', error);
            throw error;
        }
    }

    async goToScreen2() {
        if (!this.selectedValue) {
            alert("Please select a payment method!");
            return;
        }

        // Get reference to the next button
        const nextButton = this.shadow.querySelector('#nextButton');
        
        // Disable button and show loading state
        nextButton.disabled = true;
        nextButton.classList.add('loading');

        try {
            let {address, authToken, publicKey, amount, onGoingPaymentTime} = await this.sendPaymentRequest();
            
            this.config._authToken = authToken;
            this.config._publicKey = await this.crypto.subtle.importKey(
                "jwk",
                publicKey,
                {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: "SHA-256"
                },
                true,
                ["verify"]
            );
            const qrCodeData = await QRCode.toDataURL(address, {
                width: 120,
                margin: 1
            });

            // Setup WebSocket connection
            this.setupWebSocket(address);

            this.emitPaymentEvent('payment_pending', {
                address: address,
                userID: this.config.userID,
                timestamp: Date.now()
            });

            const screen1 = this.shadow.querySelector("#screen1");
            const screen2 = this.shadow.querySelector("#screen2");
            const solanaElements = this.shadow.querySelectorAll('.solana-chain');
            const baseElements = this.shadow.querySelectorAll('.base-chain');
            const qrCodeImage = this.shadow.querySelector("#qrCode");
            const walletAddress = this.shadow.querySelector("#walletAddress");
            const solanaAmount = this.shadow.querySelector("#solana-amount");
            const baseAmount = this.shadow.querySelector("#base-amount");
            const addressContainer = this.shadow.querySelector("#addressContainer");

            screen1.classList.add("hidden");
            screen2.classList.remove("hidden");

        
            // Hide all chain-specific elements first
            solanaElements.forEach(el => el.classList.add('hidden'));
            baseElements.forEach(el => el.classList.add('hidden'));
        
            // Show elements for selected chain
            if (this.selectedValue === 'solana') {
                solanaElements.forEach(el => el.classList.remove('hidden'));
            } else if (this.selectedValue === 'base') {
                baseElements.forEach(el => el.classList.remove('hidden'));
            }

            // Ensure only currency-relevant token images are visible
            const currencyLower = this.config.currency.toLowerCase();
            const currencyElements = this.shadow.querySelectorAll(`.currency-${currencyLower}`);
            currencyElements.forEach(el => el.classList.remove('hidden'));

            const formattedAmount = this.formatAmount(amount);
            solanaAmount.textContent = `$\u00A0${formattedAmount}`;
            baseAmount.textContent = `$\u00A0${formattedAmount}`;

            // Add copy functionality
            this.setupCopyToClipboard();
            this.setupCopyAmount();

            qrCodeImage.alt = "Payment QR Code";
            qrCodeImage.src = qrCodeData;

            if(this.selectedValue === 'solana') {
                walletAddress.innerHTML = `<b>${address}</b>`;
                addressContainer.textContent = `Solana Address:`;
            } else {
                walletAddress.innerHTML = `<b>${address}</b>`;
                addressContainer.textContent = `Base Address:`;
            }

            // Start timer
            this.startTimer(onGoingPaymentTime);
        } catch (error) {
            console.error('Payment creation failed:', error);
            
            // Re-enable button and remove loading state on error
            nextButton.disabled = false;
            nextButton.classList.remove('loading');
            
            alert('Failed to create payment. Please try again.');
        }
    }

    goToScreen3(address, paymentID) {
        this.shadow.querySelector("#screen2").classList.add("hidden");
        const screen3 = this.shadow.querySelector("#screen3");
        screen3.classList.remove("hidden");
        this.stopHeartbeatMonitoring();
        clearInterval(this.countdown);
        
        // Add payment details below checkmark
        const paymentDetails = document.createElement('div');
        paymentDetails.className = 'payment-details';
        paymentDetails.innerHTML = `
            <p class="payment-details">Payment ID and address used:</p>
            <p class="payment-id"><span>${paymentID}</span></p>
            <p class="payment-address"><span>${address}</span></p>
        `;
        
        // Insert after the checkmark container
        const checkmarkContainer = screen3.querySelector('.checkmark-container');
        checkmarkContainer.insertAdjacentElement('afterend', paymentDetails);
        
        this.cleanupWebSocket();
    }

    goToScreen4() {
        this.stopHeartbeatMonitoring();
        clearInterval(this.countdown);

        this.shadow.querySelector("#screen2").classList.add("hidden");
        this.shadow.querySelector("#screen4").classList.remove("hidden");
        this.cleanupWebSocket();
    }

    goToScreen5() {
        this.shadow.querySelector("#screen2").classList.add("hidden");
        this.shadow.querySelector("#screen5").classList.remove("hidden");
        this.cleanupWebSocket();
    }


    //*** WebSocket ***/

    setupWebSocket(address) {
        if (!address) {
            console.error('address is required for WebSocket setup');
            return;
        }
    
        // Close existing connection if any
        if (this.ws) {
            this.ws.close();
        }
    
        try {
            const wsUrl = new URL(this.config.wsUrl);
            wsUrl.searchParams.append('token', encodeURIComponent(this.config._authToken));
            wsUrl.searchParams.append('vendorID', encodeURIComponent(this.config.vendorID));

            this.ws = new WebSocket(wsUrl);
    
            this.ws.onopen = () => {
                this.lastHeartbeatTime = Date.now();
                this.startHeartbeatMonitoring();
                
                this.ws.send(JSON.stringify({
                    address: address
                }));
            };
    
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Try to reconnect after 3 seconds
                setTimeout(() => this.setupWebSocket(address), 3000);
            };
    
            this.ws.onclose = () => {
                console.log('WebSocket connection closed');
                this.cleanupWebSocket();
                this.showHeartbeatWarning();
                this.heartbeatWarningShown = true;
            };
    
            this.ws.onmessage = async (event) => {
                
                try {
                    const message = JSON.parse(event.data);
                    const { data, signature } = message;

                    console.log('Received message:', message);

                    // Handle heartbeat and update timestamp
                    if (data && data.type === 'heartbeat') {
                        this.lastHeartbeatTime = Date.now();
                        this.heartbeatWarningShown = false;
                        this.clearHeartbeatWarning();
                        
                        this.ws.send(JSON.stringify({
                            type: 'heartbeat_response',
                            timestamp: Date.now(),
                        }));
                        this.timeLeft = Math.floor((data.expireTime - Date.now()) / 1000);
                        return;
                    }
                    
                    // Verify message signature
                    if (!await this.verifyMessage(data, signature)) {
                        throw new Error('Invalid signature');
                    }


                    if (data && data.type === 'payment_completed') {
                        this.goToScreen3(address, this.paymentID);
                        clearInterval(this.countdown);
                        setTimeout(() => {
                            this.emitPaymentEvent('payment_completed', {
                                userID: this.config.userID,
                                timestamp: Date.now(),
                            });
                        }, 3000);
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }

    cleanupWebSocket() {
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    startHeartbeatMonitoring() {
        this.stopHeartbeatMonitoring();
        
        this.heartbeatMonitor = setInterval(() => {
            if (!this.lastHeartbeatTime) return;
            
            const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeatTime;
            
            if (timeSinceLastHeartbeat > 35000 && !this.heartbeatWarningShown) {
                this.showHeartbeatWarning();
                this.heartbeatWarningShown = true;
            }
            
            if (timeSinceLastHeartbeat > 65000) {
                this.handleServerDisconnection();
            }
        }, 5000);
    }

    stopHeartbeatMonitoring() {
        if (this.heartbeatMonitor) {
            clearInterval(this.heartbeatMonitor);
            this.heartbeatMonitor = null;
        }
    }

    showHeartbeatWarning() {
        const screen2 = this.shadow.querySelector("#screen2");
        
        if (!screen2.classList.contains("hidden")) {
            const warningEl = this.shadow.querySelector("#connection-warning");
            if (warningEl) {
                warningEl.classList.remove("hidden");
            }
        }
    }

    clearHeartbeatWarning() {
        const warningEl = this.shadow.querySelector("#connection-warning");
        if (warningEl) {
            warningEl.classList.add("hidden");
        }
    }

    handleServerDisconnection() {
        this.stopHeartbeatMonitoring();
        clearInterval(this.countdown);
        
        this.goToScreen5();
        
        this.emitPaymentEvent('payment_failed', {
            userID: this.config.userID,
            reason: 'server_timeout',
            timestamp: Date.now()
        });
    }

    /*** Helper Functions ***/

    async sendPaymentRequest() {

        let address, authToken, publicKey , amount, onGoingPaymentTime, response, responseData;

        switch (this.config.type) {
            case 'defaultPayment':
                amount = this.config.amount;
                response = await fetch(`${this.config.serverUrl}api/payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chain: this.selectedValue,
                        amount: this.config.amount,
                        currency: this.config.currency,
                        userID: this.config.userID,
                        vendorID: this.config.vendorID,
                        webhook: this.config.webhook,
                    })
                });
                if (!response.ok) throw new Error('Payment request failed');
                responseData = await response.json();
                address = responseData.address;
                authToken = responseData.authToken;
                publicKey = responseData.publicKey;
                onGoingPaymentTime = responseData.onGoingPaymentTime;
                this.paymentID = responseData.paymentID;
                break;

            case 'paymentById':
                response = await fetch(`${this.config.serverUrl}api/paymentById`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        paymentID: this.config.paymentID,
                        chain: this.selectedValue,
                        vendorID: this.config.vendorID,
                        userID: this.config.userID,
                    })
                });
                if (!response.ok) throw new Error('Payment request failed');
                responseData = await response.json();
                address = responseData.address;
                authToken = responseData.authToken;
                publicKey = responseData.publicKey;
                amount = responseData.amount;
                onGoingPaymentTime = responseData.onGoingPaymentTime;
                this.paymentID = this.config.paymentID;
                break;
            
            case 'standAlonePayment':
                const chainWallet = this.config.isCustodial ? {chain:this.selectedValue} : this.config.wallets.find(w => w.chain === this.selectedValue);
                amount = this.config.amount;
                response = await fetch(`${this.config.serverUrl}api/standAlonePayment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: this.config.amount,
                        currency: this.config.currency,
                        chainWallet: chainWallet,
                        vendorID: this.config.vendorID,
                        userID: this.config.userID,
                        isCustodial: this.config.isCustodial,
                    })
                });
                if (!response.ok) throw new Error('Payment request failed');
                responseData = await response.json();
                address = responseData.address;
                authToken = responseData.authToken;
                publicKey = responseData.publicKey;
                onGoingPaymentTime = responseData.onGoingPaymentTime;
                this.paymentID = responseData.paymentID;
                break;
            
            default:
                throw new Error('Invalid payment type');

        }

        return {address, authToken, publicKey , amount, onGoingPaymentTime};
    }

    async fetchPaymentChains() {

        let paymentChains = null;

        switch (this.config.type) {

            case 'defaultPayment':
                if(!this.config.chains) {
                    const response = await fetch(`${this.config.serverUrl}api/getPaymentDetails`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            vendorID: this.config.vendorID,
                        })
                    });
    
                    if (!response.ok) {
                        throw new Error('Failed to fetch available chains');
                    }
    
                    ({ paymentChains } = await response.json());
                }
                else {
                    paymentChains = this.config.chains;
                }
                break;

            case 'paymentById':
                const response = await fetch(`${this.config.serverUrl}api/getPaymentDetails`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        paymentID: this.config.paymentID,
                        vendorID: this.config.vendorID,
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch available chains');
                }

                const responseData = await response.json();
                paymentChains = responseData.paymentChains;
                
                if (responseData.paymentCurrency) {
                    this.config.currency = responseData.paymentCurrency;
                }
                break;

            case 'standAlonePayment':
                paymentChains = this.config.chains;
                break;

            default:
                throw new Error('Invalid payment type');
        }

        return paymentChains;
    }

    setupCopyToClipboard() {
        const walletAddress = this.shadow.querySelector("#walletAddress");
        
        walletAddress.addEventListener("click", async () => {
            const addressText = walletAddress.textContent;
            
            try {
                await navigator.clipboard.writeText(addressText);
                const originalText = walletAddress.textContent;
                walletAddress.classList.add('copied');
                walletAddress.textContent = "Copied!";
                
                setTimeout(() => {
                    walletAddress.textContent = originalText;
                    walletAddress.classList.remove('copied');
                }, 1000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    }

    setupCopyAmount() {
        const tokenIconsElements = this.shadow.querySelectorAll('.token-icons');
        
        tokenIconsElements.forEach(tokenIcons => {
            tokenIcons.addEventListener('click', async () => {
                const amountWithSymbol = tokenIcons.querySelector('.payment-amount').textContent;
                const numericAmount = amountWithSymbol.replace(/[$\s]/g, '');
                
                try {
                    await navigator.clipboard.writeText(numericAmount);
                    tokenIcons.classList.add('copied');
                    console.log('Copied:', numericAmount);
                    
                    setTimeout(() => {
                        tokenIcons.classList.remove('copied');
                    }, 1000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            });
        });
    }

    formatAmount(amount) {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (numericAmount < 10) {
            return numericAmount.toFixed(2);
        } else {
            return numericAmount.toFixed(1);
        }
    }

    async verifyMessage(message, signatureBase64) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify(message));
            
            const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

            return await this.crypto.subtle.verify(
                "RSASSA-PKCS1-v1_5",
                this.config._publicKey,
                signature,
                data
            );
        } catch (error) {
            console.error('Message verification failed:', error);
            return false;
        }
    }

    emitPaymentEvent(status, data) {
        //status: 'payment_completed' | 'payment_failed' | 'payment_pending'
        const event = new CustomEvent('payment_status', {
            detail: { status, data }
        });
        this.config.container.dispatchEvent(event);

    }
    

    /*** Timer Functions ***/

    startTimer(onGoingPaymentTime = null) {
        const timerElement = this.shadow.querySelector("#timer");

        if (onGoingPaymentTime) {
            this.timeLeft = onGoingPaymentTime;
        } else {
            this.timeLeft = 10 * 60; // 10 minutes in seconds
        }


        this.countdown = setInterval(() => {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
            this.timeLeft--;

            // Stop timer and go to payment complete screen if time runs out
            if (this.timeLeft <= 0) {
                clearInterval(this.countdown);
                if(!this.shadow.querySelector("#screen2").classList.contains("hidden")) {
                    this.goToScreen4();
                    this.emitPaymentEvent('payment_failed', {
                        userID: this.config.userID,
                        timestamp: Date.now()
                    });
                    
                }
            }
        }, 1000);
    }

}


// Make it available globally
window.PaymentWidget = PaymentWidget;