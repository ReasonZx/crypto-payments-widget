# Crypto Payments Widget

Simple integration for stablecoin crypto payments.

## Usage

```html
<head>
    <script src="https://cdn.jsdelivr.net/gh/ReasonZx/crypto-payments-widget@2.3.0/dist/crypto-payments-widget.js"></script>
</head>
<body>
    <div id="payment-container"></div>
    <script>
        const widget = new PaymentWidget({
            type: 'standAlonePayment',
            vendorID: <your_vendor_id>,
            amount: <amount>,
            currency: <'EUR' or 'USD'>
            isCustodial: <true_or_false>,
            wallets: <[{"chain":"your_address_chain","chainAddress":"your_address"}]>, (only needed is isCustodial is false)
            userID: <the_user_that_will_be_paying>
        });
    </script>
</body>
```