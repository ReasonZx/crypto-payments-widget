import styles from './styles.css?inline'
import template from './template.html?raw'
import QRCode from 'qrcode';




class PaymentWidget {
    constructor(config = {}) {
        this.config = {
            amount: config.amount || 5,
            container: config.container || document.body,
            serverUrl: config.serverUrl || 'https://crypto-payments-backend-90e8ca11c89f.herokuapp.com/',
            wsUrl: config.wsUrl || 'https://crypto-payments-backend-90e8ca11c89f.herokuapp.com/',
            wallets: config.wallets || { 'solana': null, 'base': null },
            userID: config.userID || null,
        };
        this._authToken = null;
        this._publicKey = null;
        this.crypto = window.crypto;

        // Get available chains from wallets
        this.availableChains = Object.keys(this.config.wallets);

        
        // Validate at least one chain
        if (this.availableChains.length === 0) {
            throw new Error('At least one chain must be configured in wallets');
        }


        this.init();
        this.selectedValue = null;
        this.ws = null;
    }

    init() {
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
            if (!this.availableChains.includes(chainType)) {
                option.remove();
            }
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
    }

    setupWebSocket(paymentId) {
        if (!paymentId) {
            console.error('PaymentId is required for WebSocket setup');
            return;
        }
    
        // Close existing connection if any
        if (this.ws) {
            this.ws.close();
        }
    
        try {
            const wsUrl = new URL(this.config.wsUrl);
            wsUrl.searchParams.append('token', this.config._authToken);


            this.ws = new WebSocket(wsUrl);
    
            this.ws.onopen = () => {
                this.ws.send(JSON.stringify({
                    type: 'subscribe_payment',
                    paymentId: paymentId
                }));

                this.pingInterval = setInterval(() => {
                    if (this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 20000);
            };
    
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Try to reconnect after 3 seconds
                setTimeout(() => this.setupWebSocket(paymentId), 3000);
            };
    
            this.ws.onclose = () => {
                clearInterval(this.pingInterval);
            };
    
            this.ws.onmessage = async (event) => {
                try {
                    const { data, signature, timestamp } = JSON.parse(event.data);

                    const messageData = typeof data === 'string' ? JSON.parse(data) : data;

                    // Verify timestamp is recent
                    if (Date.now() - timestamp > 5000) {
                        throw new Error('Message expired');
                    }

                    // Verify message signature
                    if (!await this.verifyMessage(data, signature)) {
                        throw new Error('Invalid signature');
                    }
                    if (messageData.type === 'payment_completed') {
                        this.goToScreen3();
                    }

                } catch (error) {
                    console.error('Error processing message:', error);
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
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
            nextButton.addEventListener('click', () => this.goToScreen2());
        }
    }

    // Screen management
    async goToScreen2() {
        if (!this.selectedValue) {
            alert("Please select a payment method!");
            return;
        }

        try {

            const selectedWallet = this.config.wallets[this.selectedValue];

            const response = await fetch(`${this.config.serverUrl}api/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chain: this.selectedValue,
                    amount: this.config.amount,
                    userID: this.config.userID,
                    wallet: selectedWallet,
                })
            });

            if (!response.ok) throw new Error('Payment request failed');
            const { address, authToken, publicKey } = await response.json();
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
      
            const formattedAmount = this.formatAmount(this.config.amount);
            solanaAmount.textContent = `$\u00A0${formattedAmount}`;
            baseAmount.textContent = `$\u00A0${formattedAmount}`;

            // Add copy functionality
            this.setupCopyToClipboard();
            this.setupCopyAmount()

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
            this.startTimer();
        } catch (error) {
            console.error('Payment creation failed:', error);
            alert('Failed to create payment. Please try again.');
        }
    }

    goToScreen3() {
        this.shadow.querySelector("#screen2").classList.add("hidden");
        this.shadow.querySelector("#screen3").classList.remove("hidden");
        this.cleanupWebSocket();
    }

    goToScreen4() {
        this.shadow.querySelector("#screen2").classList.add("hidden");
        this.shadow.querySelector("#screen4").classList.remove("hidden");
        this.cleanupWebSocket();
    }



    /** Helper Functions **/
    

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
        const tokenIcons = this.shadow.querySelector('.token-icons');
        
        tokenIcons.addEventListener('click', async () => {
            const amountWithSymbol = tokenIcons.querySelector('.payment-amount').textContent;
            const numericAmount = amountWithSymbol.replace(/[$\s]/g, ''); // Remove $ and spaces
            
            try {
                await navigator.clipboard.writeText(numericAmount);
                tokenIcons.classList.add('copied');
                
                setTimeout(() => {
                    tokenIcons.classList.remove('copied');
                }, 1000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    }

    formatAmount(amount) {
        if (amount < 10) {
            return amount.toFixed(2);
        } else {
            return amount.toFixed(1);
        }
    }

    cleanupWebSocket() {
        if (this.ws) {
            clearInterval(this.pingInterval);
            this.ws.close();
            this.ws = null;
        }
    }

    startTimer() {
        const timerElement = this.shadow.querySelector("#timer");
        let timeLeft = 10 * 60; // 10 minutes in seconds

        const countdown = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
            timeLeft--;

            // Stop timer and go to payment complete screen if time runs out
            if (timeLeft < 0) {
                clearInterval(countdown);
                if(!this.shadow.querySelector("#screen2").classList.contains("hidden")) {
                    this.goToScreen4();
                }
            }
        }, 1000);
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

}


// Make it available globally
window.PaymentWidget = PaymentWidget;