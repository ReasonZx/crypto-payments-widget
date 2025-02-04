# Crypto Payments Widget

Simple integration for crypto payments supporting Solana and Base chains.

## Installation

```html
<script src="https://cdn.yourcdn.com/crypto-payments.js"></script>
```

## Usage

```html
<div id="payment-container"></div>
<script>
  const widget = new PaymentWidget({
    amount: 50,
    container: document.getElementById('payment-container'),
    serverUrl: 'https://your-backend.com',
    wsUrl: 'wss://your-backend.com'
  });
</script>
