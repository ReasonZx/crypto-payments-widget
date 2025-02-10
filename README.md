# Crypto Payments Widget

Simple integration for stablecoin crypto payments.

## Usage

```html
<head>
    <script src="https://cdn.jsdelivr.net/gh/ReasonZx/crypto-payments-widget@v0.1.0/dist/crypto-payments-widget.js"></script>
</head>
<body>
    <div id="payment-container"></div>
    <script>
        const widget = new PaymentWidget({
            amount: <amount_of_your_payment>,
            wallets: <{
                    'solana': 'your_sol_wallet',
                    'base': 'your_base_wallet'  
                },>,
            container: document.getElementById('payment-container'),
            userID: <the_user_that_will_be_paying>,
        });
    </script>
</body>
```