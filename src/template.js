export const widgetTemplate = `
    <div class="widget">
    <!-- Screen 1: Select Payment Method -->
    <div id="screen1">
      <h2>Choose a Payment Method</h2>
      <div class="dropdown">
		<div class="dropdown-select" id="customSelect">
			<span class="selected">Select blockchain</span>
			<div class="dropdown-arrow">▼</div>
		</div>
		<div class="dropdown-options">
			<div class="option" data-value="solana">
				<div class="option-main">
					<img src="./img/sol-logo.png" alt="Solana" class="option-icon">
					<span>Solana</span>
				</div>
				<div class="option-tokens">
					<img src="./img/usdc_sol.png" alt="USDC" class="token-icon">
					<span>or</span>
					<img src="./img/usdt_sol.png" alt="USDT" class="token-icon">
				</div>
			</div>
			<div class="option" data-value="base">
				<div class="option-main">
					<img src="./img/base-logo.png" alt="Base" class="option-icon">
					<span>Base</span>
				</div>
				<div class="option-tokens">
					<img src="./img/usdc_base.png" alt="USDC" class="token-icon">
				</div>
			</div>
		</div>
	</div>
    <button class="button disabled" id="nextButton" disabled>Next</button>
    </div>

    <!-- Screen 2: Payment Details -->
	<div id="screen2" class="hidden">
		<h2>Payment Details</h2>
		<div class="payment-details-grid">
			<div class="qr-container">
				<img id="qrCode" src="" alt="Loading QR Code...">
			</div>
			<!-- Chain specific instructions -->
			<div class="chain-instructions solana-chain hidden">
				<p>Please send the amount below to the address indicated on Solana</p>
				<span class="token-icons">
					<span class="payment-amount" id="solana-amount">Loading...</span>
					<img src="./img/usdc_sol.png" alt="USDC" class="inline-token">
					<img src="./img/usdt_sol.png" alt="USDT" class="inline-token">
				</span>
			</div>
			<div class="chain-instructions base-chain hidden">
				<p>Please send the amount below to the address indicated on Base</p>
				<span class="token-icons">
					<span class="payment-amount" id="base-amount">Loading...</span>
					<img src="./img/usdc_base.png" alt="USDC" class="inline-token">
				</span>
			</div>
			<div class="address-section">
				<span id="addressContainer">Loading...</span>
				<div id="walletAddress">Loading...</div>
			</div>
		</div>
		<div class="payment-status">
			<div class="timer-container">
				<i class="fas fa-clock"></i>
				<span id="timer" class="timer">Time Left: 10:00</span>
			</div>
			<p class="status-message">Waiting for payment...</p>
		</div>
	</div>

    <!-- Screen 3: Payment Completed -->
    <div id="screen3" class="hidden">
		<div class="payment-success">
			<h2>Payment Completed!</h2>
			<div class="checkmark-container">
				<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
					<circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
					<path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
				</svg>
			</div>
		</div>
	</div>

	<!-- Screen 4: Payment Expired -->
	<div id="screen4" class="hidden">
		<div class="payment-expired">
			<h2>Payment window expired.</h2>
			<div class="cross-container">
				<svg class="cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
					<circle class="cross-circle" cx="26" cy="26" r="25" fill="none"/>
					<path class="cross-x" fill="none" d="M16 16 36 36 M36 16 16 36"/>
				</svg>
			</div>
			<p>Please restart the process</p>
		</div>
	</div>
`;