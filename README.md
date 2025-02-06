# Crypto Payments Widget

Simple integration for stablecoin crypto payments.

## Usage

```html
<head>
    <script src="https://cdn.jsdelivr.net/gh/ReasonZx/crypto-payments-widget@v0.0.8/dist/crypto-payments-widget.js"></script>
</head>
<body>
    <div id="payment-container"></div>
    <script>
        const widget = new PaymentWidget({
            amount: 5,
            container: document.getElementById('payment-container'),
            serverUrl: 'https://crypto-payments-backend-90e8ca11c89f.herokuapp.com/',
            wsUrl: 'wss://crypto-payments-backend-90e8ca11c89f.herokuapp.com',
            chains: ['base', 'solana'],
        });
    </script>
</body>
```