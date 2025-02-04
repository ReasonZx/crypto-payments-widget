const nt = `
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
`, ot = `
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background-color: #f5f5f5;
}

.widget {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    width: 400px;
    min-height: 400px;
    height: calc(200px + (var(--num-options, 2) * 60px));
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 30px;
}

.hidden {
    display: none !important;
}
/* Screen 1 */
.dropdown {
    margin: 20px 0;
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
}

.dropdown-select {
    width: 100%;
    padding: 15px 20px;
    font-size: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    background: linear-gradient(145deg, #ffffff, #f5f5f5);
    color: #333;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 5px 5px 10px #d9d9d9,
                -5px -5px 10px #ffffff;
    transition: all 0.3s ease;
}

.dropdown-select:hover {
    background: linear-gradient(145deg, #f2fffa, #dcfff2);
    box-shadow: 6px 6px 12px #d9d9d9,
                -6px -6px 12px #ffffff;
    border-color: #4dbb9a;
    color: #4dbb9a;
}

.dropdown-arrow {
    transition: transform 0.3s ease;
}

.dropdown.open .dropdown-arrow {
    transform: rotate(180deg);
}

.dropdown-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 12px;
    margin-top: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    max-height: calc(var(--num-options, 2) * 60px);
    overflow-y: auto;
}

.dropdown.open .dropdown-options {
    opacity: 1;
    visibility: visible;
}

.option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.option:hover {
    background: linear-gradient(145deg, #f2fffa, #dcfff2);
    color: #4dbb9a;
}

.option-main {
    display: flex;
    align-items: center;
    gap: 12px;
}

.option-main span {
    line-height: 24px;
}

.option-tokens {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
}

.option-icon {
    width: 24px;
    height: 24px;
}

.token-icon {
    width: 24px;
    height: 24px;
}

.selected {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0;
}

.selected .option-tokens {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
    margin-right: 14px;
}

#screen1 {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.button {
    width: 100%;
    margin-top: auto;
    padding: 10px 20px;
    background-color: #4dbb9a;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.button:hover {
    background-color: #008359;
}

.button.disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
}

.button.disabled:hover {
    background-color: #cccccc;
}

/* Screen 2 */

.payment-details-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    /* gap: 20px; */
    /* padding: 20px; */
    align-items: start;
    
}

.qr-container {
    grid-row: 1;
    grid-column: 2;
    background: white;
    padding-right: 5px;
    padding-top: 20px;
    /* padding: 10px; */
    /* border-radius: 12px; */
    /* box-shadow: 0 4px 8px rgba(0,0,0,0.1); */
    /* width: 150px; */
}

#qrCode {
    width: 120px;
    height: 120px;
    margin: 0 auto;
}

.chain-instructions {
    text-align: left;
    padding: 10px;
}

.chain-instructions p {
    margin-bottom: 15px;
    text-align: left;
}

.payment-amount {
    font-weight: 500;
    white-space: nowrap;
    color: #666;
    font-size: 22px;
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: auto;
}

.inline-token {
    width: 30px;
    height: 30px;
    vertical-align: middle;
    display: inline-block;
    flex-shrink: 0;
}

.token-icons {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    width: 205px;
    height: 25px;
    margin-top: 11px;
    margin-bottom: 25px;
    padding: 5px 15px;
    background: linear-gradient(145deg, #f5f5f5, #ffffff);
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    box-shadow: inset 1px 1px 3px rgba(0,0,0,0.05);
    cursor: pointer;
}

.token-icons:hover {
    background: linear-gradient(145deg, #f2fffa, #dcfff2);
    box-shadow: 3px 3px 6px #d9d9d9,
                -3px -3px 6px #ffffff;
    border-color: #4dbb9a;
    color: #4dbb9a;
}

.token-icons:hover .payment-amount {
    color: #4dbb9a;
}

.token-icons.copied {
    font-family: 'Courier New', monospace;
    background: #4dbb9a;
    border-color: #4dbb9a;
    color: white;
}

.token-icons.copied::after {
    content: 'Copied!';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #4dbb9a;
    color: white;
    border-radius: 10px;
    z-index: 1;
}

.token-icons.copied > * {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.token-icons.copied .payment-amount {
    color: white;
    font-family: 'Courier New', monospace;
    font-size: 13px;
}

.address-section {
    grid-row: 2;
    grid-column: 1 / 3;
    width: 100%;
    text-align: center;
}

#addressContainer {
    grid-row: 1;
    grid-column: 1;
    display: flex;
    align-items: top;
    text-align: left;
    padding: 5px 10px;
    /* margin-bottom: 1px; */
    font-size: 16px;
    color: #666;
    height: 100%;
}

#walletAddress {
    width: 95%;
    padding: 5px 0px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    letter-spacing: 0.01px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    background: linear-gradient(145deg, #ffffff, #f5f5f5);
    color: #333;
    cursor: pointer;
    justify-content: space-between;
    align-items: center;
    word-break: break-all;
    text-align: center;
    margin: 0 auto;
    box-shadow: 1px 1px 3px #d9d9d9,
                -1px -1px 3px #ffffff;
    transition: all 0.3s ease;
}

#walletAddress:hover {
    background: linear-gradient(145deg, #f2fffa, #dcfff2);
    box-shadow: 3px 3px 6px #d9d9d9,
                -3px -3px 6px #ffffff;
    border-color: #4dbb9a;
    color: #4dbb9a;
}

#walletAddress.copied {
    background: #4dbb9a;
    border-color: #4dbb9a;
    color: white;
}

.payment-status {
    margin-top: 65px;
}

.timer-container {
    /* gap: 8px; */
    /* margin: 10px; */
    font-size: 16px;
    color: #666;
    font-weight: 500;
    margin-right: 4px;
}

.status-message {
    color: #666;
    font-size: 14px;
    margin-top: 7px;
    animation: fadeIn 1s ease-in-out infinite alternate;
}

/* Screen 3 */

#screen3 {
    display: flex;
    width: 100%;
    justify-content: center;
    height: 100vh;
    flex: 1;
    flex-direction: column;
    align-items: center;
}

/* .animation-complete {
    animation: fadeIn 1s ease-in-out infinite alternate;
    color: #4dbb9a;
    font-size: 24px;
}  */

.checkmark-container {
    width: 80px;
    height: 80px;
    margin: 20px auto;
}

.checkmark {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: block;
    stroke-width: 2;
    stroke: #4dbb9a;
    stroke-miterlimit: 10;
    animation: scale .5s ease-in-out 1s both;
}

.checkmark-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 1.5;
    stroke-miterlimit: 10;
    stroke: #4dbb9a;
    animation: stroke 0.9s cubic-bezier(0.65, 0, 0.45, 1) forwards,
               ease-in-out 0.8s forwards;
}

.checkmark-check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    stroke-width: 2;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
    100% {
        stroke-dashoffset: 0;
    }
}

@keyframes scale {
    0%, 100% {
        transform: none;
    }
    50% {
        transform: scale3d(1.1, 1.1, 1);
    }
}


@keyframes fadeIn {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
}

/* Screen4 */

#screen4 {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    width: 100%;
    margin: auto;
}

.cross-container {
    width: 80px;
    height: 80px;
    margin: 20px auto;
}

.cross {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: block;
    stroke-width: 2;
    stroke: #ff6b6b;
    stroke-miterlimit: 10;
    animation: scale .5s ease-in-out 1s both;
}

.cross-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 1.5;
    stroke-miterlimit: 10;
    stroke: #ff6b6b;
    animation: stroke 0.9s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.cross-x {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    stroke-width: 2;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

.payment-expired {
    text-align: center;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}


.payment-expired h2 {
    color: #ff6b6b;
    margin-bottom: 20px;
}

.payment-expired p {
    margin-top: 20px;
    font-size: 16px;
}
`;
function rt(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var F = {}, W, xe;
function it() {
  return xe || (xe = 1, W = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), W;
}
var $ = {}, q = {}, Ee;
function D() {
  if (Ee) return q;
  Ee = 1;
  let r;
  const o = [
    0,
    // Not used
    26,
    44,
    70,
    100,
    134,
    172,
    196,
    242,
    292,
    346,
    404,
    466,
    532,
    581,
    655,
    733,
    815,
    901,
    991,
    1085,
    1156,
    1258,
    1364,
    1474,
    1588,
    1706,
    1828,
    1921,
    2051,
    2185,
    2323,
    2465,
    2611,
    2761,
    2876,
    3034,
    3196,
    3362,
    3532,
    3706
  ];
  return q.getSymbolSize = function(t) {
    if (!t) throw new Error('"version" cannot be null or undefined');
    if (t < 1 || t > 40) throw new Error('"version" should be in range from 1 to 40');
    return t * 4 + 17;
  }, q.getSymbolTotalCodewords = function(t) {
    return o[t];
  }, q.getBCHDigit = function(i) {
    let t = 0;
    for (; i !== 0; )
      t++, i >>>= 1;
    return t;
  }, q.setToSJISFunction = function(t) {
    if (typeof t != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    r = t;
  }, q.isKanjiModeEnabled = function() {
    return typeof r < "u";
  }, q.toSJIS = function(t) {
    return r(t);
  }, q;
}
var Q = {}, Se;
function we() {
  return Se || (Se = 1, function(r) {
    r.L = { bit: 1 }, r.M = { bit: 0 }, r.Q = { bit: 3 }, r.H = { bit: 2 };
    function o(i) {
      if (typeof i != "string")
        throw new Error("Param is not a string");
      switch (i.toLowerCase()) {
        case "l":
        case "low":
          return r.L;
        case "m":
        case "medium":
          return r.M;
        case "q":
        case "quartile":
          return r.Q;
        case "h":
        case "high":
          return r.H;
        default:
          throw new Error("Unknown EC Level: " + i);
      }
    }
    r.isValid = function(t) {
      return t && typeof t.bit < "u" && t.bit >= 0 && t.bit < 4;
    }, r.from = function(t, e) {
      if (r.isValid(t))
        return t;
      try {
        return o(t);
      } catch {
        return e;
      }
    };
  }(Q)), Q;
}
var G, ve;
function st() {
  if (ve) return G;
  ve = 1;
  function r() {
    this.buffer = [], this.length = 0;
  }
  return r.prototype = {
    get: function(o) {
      const i = Math.floor(o / 8);
      return (this.buffer[i] >>> 7 - o % 8 & 1) === 1;
    },
    put: function(o, i) {
      for (let t = 0; t < i; t++)
        this.putBit((o >>> i - t - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(o) {
      const i = Math.floor(this.length / 8);
      this.buffer.length <= i && this.buffer.push(0), o && (this.buffer[i] |= 128 >>> this.length % 8), this.length++;
    }
  }, G = r, G;
}
var Z, ke;
function at() {
  if (ke) return Z;
  ke = 1;
  function r(o) {
    if (!o || o < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = o, this.data = new Uint8Array(o * o), this.reservedBit = new Uint8Array(o * o);
  }
  return r.prototype.set = function(o, i, t, e) {
    const n = o * this.size + i;
    this.data[n] = t, e && (this.reservedBit[n] = !0);
  }, r.prototype.get = function(o, i) {
    return this.data[o * this.size + i];
  }, r.prototype.xor = function(o, i, t) {
    this.data[o * this.size + i] ^= t;
  }, r.prototype.isReserved = function(o, i) {
    return this.reservedBit[o * this.size + i];
  }, Z = r, Z;
}
var X = {}, Be;
function ct() {
  return Be || (Be = 1, function(r) {
    const o = D().getSymbolSize;
    r.getRowColCoords = function(t) {
      if (t === 1) return [];
      const e = Math.floor(t / 7) + 2, n = o(t), s = n === 145 ? 26 : Math.ceil((n - 13) / (2 * e - 2)) * 2, a = [n - 7];
      for (let c = 1; c < e - 1; c++)
        a[c] = a[c - 1] - s;
      return a.push(6), a.reverse();
    }, r.getPositions = function(t) {
      const e = [], n = r.getRowColCoords(t), s = n.length;
      for (let a = 0; a < s; a++)
        for (let c = 0; c < s; c++)
          a === 0 && c === 0 || // top-left
          a === 0 && c === s - 1 || // bottom-left
          a === s - 1 && c === 0 || e.push([n[a], n[c]]);
      return e;
    };
  }(X)), X;
}
var ee = {}, Ae;
function lt() {
  if (Ae) return ee;
  Ae = 1;
  const r = D().getSymbolSize, o = 7;
  return ee.getPositions = function(t) {
    const e = r(t);
    return [
      // top-left
      [0, 0],
      // top-right
      [e - o, 0],
      // bottom-left
      [0, e - o]
    ];
  }, ee;
}
var te = {}, Te;
function dt() {
  return Te || (Te = 1, function(r) {
    r.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    const o = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    r.isValid = function(e) {
      return e != null && e !== "" && !isNaN(e) && e >= 0 && e <= 7;
    }, r.from = function(e) {
      return r.isValid(e) ? parseInt(e, 10) : void 0;
    }, r.getPenaltyN1 = function(e) {
      const n = e.size;
      let s = 0, a = 0, c = 0, l = null, u = null;
      for (let x = 0; x < n; x++) {
        a = c = 0, l = u = null;
        for (let g = 0; g < n; g++) {
          let d = e.get(x, g);
          d === l ? a++ : (a >= 5 && (s += o.N1 + (a - 5)), l = d, a = 1), d = e.get(g, x), d === u ? c++ : (c >= 5 && (s += o.N1 + (c - 5)), u = d, c = 1);
        }
        a >= 5 && (s += o.N1 + (a - 5)), c >= 5 && (s += o.N1 + (c - 5));
      }
      return s;
    }, r.getPenaltyN2 = function(e) {
      const n = e.size;
      let s = 0;
      for (let a = 0; a < n - 1; a++)
        for (let c = 0; c < n - 1; c++) {
          const l = e.get(a, c) + e.get(a, c + 1) + e.get(a + 1, c) + e.get(a + 1, c + 1);
          (l === 4 || l === 0) && s++;
        }
      return s * o.N2;
    }, r.getPenaltyN3 = function(e) {
      const n = e.size;
      let s = 0, a = 0, c = 0;
      for (let l = 0; l < n; l++) {
        a = c = 0;
        for (let u = 0; u < n; u++)
          a = a << 1 & 2047 | e.get(l, u), u >= 10 && (a === 1488 || a === 93) && s++, c = c << 1 & 2047 | e.get(u, l), u >= 10 && (c === 1488 || c === 93) && s++;
      }
      return s * o.N3;
    }, r.getPenaltyN4 = function(e) {
      let n = 0;
      const s = e.data.length;
      for (let c = 0; c < s; c++) n += e.data[c];
      return Math.abs(Math.ceil(n * 100 / s / 5) - 10) * o.N4;
    };
    function i(t, e, n) {
      switch (t) {
        case r.Patterns.PATTERN000:
          return (e + n) % 2 === 0;
        case r.Patterns.PATTERN001:
          return e % 2 === 0;
        case r.Patterns.PATTERN010:
          return n % 3 === 0;
        case r.Patterns.PATTERN011:
          return (e + n) % 3 === 0;
        case r.Patterns.PATTERN100:
          return (Math.floor(e / 2) + Math.floor(n / 3)) % 2 === 0;
        case r.Patterns.PATTERN101:
          return e * n % 2 + e * n % 3 === 0;
        case r.Patterns.PATTERN110:
          return (e * n % 2 + e * n % 3) % 2 === 0;
        case r.Patterns.PATTERN111:
          return (e * n % 3 + (e + n) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + t);
      }
    }
    r.applyMask = function(e, n) {
      const s = n.size;
      for (let a = 0; a < s; a++)
        for (let c = 0; c < s; c++)
          n.isReserved(c, a) || n.xor(c, a, i(e, c, a));
    }, r.getBestMask = function(e, n) {
      const s = Object.keys(r.Patterns).length;
      let a = 0, c = 1 / 0;
      for (let l = 0; l < s; l++) {
        n(l), r.applyMask(l, e);
        const u = r.getPenaltyN1(e) + r.getPenaltyN2(e) + r.getPenaltyN3(e) + r.getPenaltyN4(e);
        r.applyMask(l, e), u < c && (c = u, a = l);
      }
      return a;
    };
  }(te)), te;
}
var H = {}, Pe;
function $e() {
  if (Pe) return H;
  Pe = 1;
  const r = we(), o = [
    // L  M  Q  H
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    1,
    2,
    2,
    4,
    1,
    2,
    4,
    4,
    2,
    4,
    4,
    4,
    2,
    4,
    6,
    5,
    2,
    4,
    6,
    6,
    2,
    5,
    8,
    8,
    4,
    5,
    8,
    8,
    4,
    5,
    8,
    11,
    4,
    8,
    10,
    11,
    4,
    9,
    12,
    16,
    4,
    9,
    16,
    16,
    6,
    10,
    12,
    18,
    6,
    10,
    17,
    16,
    6,
    11,
    16,
    19,
    6,
    13,
    18,
    21,
    7,
    14,
    21,
    25,
    8,
    16,
    20,
    25,
    8,
    17,
    23,
    25,
    9,
    17,
    23,
    34,
    9,
    18,
    25,
    30,
    10,
    20,
    27,
    32,
    12,
    21,
    29,
    35,
    12,
    23,
    34,
    37,
    12,
    25,
    34,
    40,
    13,
    26,
    35,
    42,
    14,
    28,
    38,
    45,
    15,
    29,
    40,
    48,
    16,
    31,
    43,
    51,
    17,
    33,
    45,
    54,
    18,
    35,
    48,
    57,
    19,
    37,
    51,
    60,
    19,
    38,
    53,
    63,
    20,
    40,
    56,
    66,
    21,
    43,
    59,
    70,
    22,
    45,
    62,
    74,
    24,
    47,
    65,
    77,
    25,
    49,
    68,
    81
  ], i = [
    // L  M  Q  H
    7,
    10,
    13,
    17,
    10,
    16,
    22,
    28,
    15,
    26,
    36,
    44,
    20,
    36,
    52,
    64,
    26,
    48,
    72,
    88,
    36,
    64,
    96,
    112,
    40,
    72,
    108,
    130,
    48,
    88,
    132,
    156,
    60,
    110,
    160,
    192,
    72,
    130,
    192,
    224,
    80,
    150,
    224,
    264,
    96,
    176,
    260,
    308,
    104,
    198,
    288,
    352,
    120,
    216,
    320,
    384,
    132,
    240,
    360,
    432,
    144,
    280,
    408,
    480,
    168,
    308,
    448,
    532,
    180,
    338,
    504,
    588,
    196,
    364,
    546,
    650,
    224,
    416,
    600,
    700,
    224,
    442,
    644,
    750,
    252,
    476,
    690,
    816,
    270,
    504,
    750,
    900,
    300,
    560,
    810,
    960,
    312,
    588,
    870,
    1050,
    336,
    644,
    952,
    1110,
    360,
    700,
    1020,
    1200,
    390,
    728,
    1050,
    1260,
    420,
    784,
    1140,
    1350,
    450,
    812,
    1200,
    1440,
    480,
    868,
    1290,
    1530,
    510,
    924,
    1350,
    1620,
    540,
    980,
    1440,
    1710,
    570,
    1036,
    1530,
    1800,
    570,
    1064,
    1590,
    1890,
    600,
    1120,
    1680,
    1980,
    630,
    1204,
    1770,
    2100,
    660,
    1260,
    1860,
    2220,
    720,
    1316,
    1950,
    2310,
    750,
    1372,
    2040,
    2430
  ];
  return H.getBlocksCount = function(e, n) {
    switch (n) {
      case r.L:
        return o[(e - 1) * 4 + 0];
      case r.M:
        return o[(e - 1) * 4 + 1];
      case r.Q:
        return o[(e - 1) * 4 + 2];
      case r.H:
        return o[(e - 1) * 4 + 3];
      default:
        return;
    }
  }, H.getTotalCodewordsCount = function(e, n) {
    switch (n) {
      case r.L:
        return i[(e - 1) * 4 + 0];
      case r.M:
        return i[(e - 1) * 4 + 1];
      case r.Q:
        return i[(e - 1) * 4 + 2];
      case r.H:
        return i[(e - 1) * 4 + 3];
      default:
        return;
    }
  }, H;
}
var ne = {}, V = {}, Ie;
function ut() {
  if (Ie) return V;
  Ie = 1;
  const r = new Uint8Array(512), o = new Uint8Array(256);
  return function() {
    let t = 1;
    for (let e = 0; e < 255; e++)
      r[e] = t, o[t] = e, t <<= 1, t & 256 && (t ^= 285);
    for (let e = 255; e < 512; e++)
      r[e] = r[e - 255];
  }(), V.log = function(t) {
    if (t < 1) throw new Error("log(" + t + ")");
    return o[t];
  }, V.exp = function(t) {
    return r[t];
  }, V.mul = function(t, e) {
    return t === 0 || e === 0 ? 0 : r[o[t] + o[e]];
  }, V;
}
var Re;
function ft() {
  return Re || (Re = 1, function(r) {
    const o = ut();
    r.mul = function(t, e) {
      const n = new Uint8Array(t.length + e.length - 1);
      for (let s = 0; s < t.length; s++)
        for (let a = 0; a < e.length; a++)
          n[s + a] ^= o.mul(t[s], e[a]);
      return n;
    }, r.mod = function(t, e) {
      let n = new Uint8Array(t);
      for (; n.length - e.length >= 0; ) {
        const s = n[0];
        for (let c = 0; c < e.length; c++)
          n[c] ^= o.mul(e[c], s);
        let a = 0;
        for (; a < n.length && n[a] === 0; ) a++;
        n = n.slice(a);
      }
      return n;
    }, r.generateECPolynomial = function(t) {
      let e = new Uint8Array([1]);
      for (let n = 0; n < t; n++)
        e = r.mul(e, new Uint8Array([1, o.exp(n)]));
      return e;
    };
  }(ne)), ne;
}
var oe, Le;
function ht() {
  if (Le) return oe;
  Le = 1;
  const r = ft();
  function o(i) {
    this.genPoly = void 0, this.degree = i, this.degree && this.initialize(this.degree);
  }
  return o.prototype.initialize = function(t) {
    this.degree = t, this.genPoly = r.generateECPolynomial(this.degree);
  }, o.prototype.encode = function(t) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const e = new Uint8Array(t.length + this.degree);
    e.set(t);
    const n = r.mod(e, this.genPoly), s = this.degree - n.length;
    if (s > 0) {
      const a = new Uint8Array(this.degree);
      return a.set(n, s), a;
    }
    return n;
  }, oe = o, oe;
}
var re = {}, ie = {}, se = {}, Ne;
function Qe() {
  return Ne || (Ne = 1, se.isValid = function(o) {
    return !isNaN(o) && o >= 1 && o <= 40;
  }), se;
}
var R = {}, Me;
function Ge() {
  if (Me) return R;
  Me = 1;
  const r = "[0-9]+", o = "[A-Z $%*+\\-./:]+";
  let i = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  i = i.replace(/u/g, "\\u");
  const t = "(?:(?![A-Z0-9 $%*+\\-./:]|" + i + `)(?:.|[\r
]))+`;
  R.KANJI = new RegExp(i, "g"), R.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), R.BYTE = new RegExp(t, "g"), R.NUMERIC = new RegExp(r, "g"), R.ALPHANUMERIC = new RegExp(o, "g");
  const e = new RegExp("^" + i + "$"), n = new RegExp("^" + r + "$"), s = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return R.testKanji = function(c) {
    return e.test(c);
  }, R.testNumeric = function(c) {
    return n.test(c);
  }, R.testAlphanumeric = function(c) {
    return s.test(c);
  }, R;
}
var qe;
function U() {
  return qe || (qe = 1, function(r) {
    const o = Qe(), i = Ge();
    r.NUMERIC = {
      id: "Numeric",
      bit: 1,
      ccBits: [10, 12, 14]
    }, r.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 2,
      ccBits: [9, 11, 13]
    }, r.BYTE = {
      id: "Byte",
      bit: 4,
      ccBits: [8, 16, 16]
    }, r.KANJI = {
      id: "Kanji",
      bit: 8,
      ccBits: [8, 10, 12]
    }, r.MIXED = {
      bit: -1
    }, r.getCharCountIndicator = function(n, s) {
      if (!n.ccBits) throw new Error("Invalid mode: " + n);
      if (!o.isValid(s))
        throw new Error("Invalid version: " + s);
      return s >= 1 && s < 10 ? n.ccBits[0] : s < 27 ? n.ccBits[1] : n.ccBits[2];
    }, r.getBestModeForData = function(n) {
      return i.testNumeric(n) ? r.NUMERIC : i.testAlphanumeric(n) ? r.ALPHANUMERIC : i.testKanji(n) ? r.KANJI : r.BYTE;
    }, r.toString = function(n) {
      if (n && n.id) return n.id;
      throw new Error("Invalid mode");
    }, r.isValid = function(n) {
      return n && n.bit && n.ccBits;
    };
    function t(e) {
      if (typeof e != "string")
        throw new Error("Param is not a string");
      switch (e.toLowerCase()) {
        case "numeric":
          return r.NUMERIC;
        case "alphanumeric":
          return r.ALPHANUMERIC;
        case "kanji":
          return r.KANJI;
        case "byte":
          return r.BYTE;
        default:
          throw new Error("Unknown mode: " + e);
      }
    }
    r.from = function(n, s) {
      if (r.isValid(n))
        return n;
      try {
        return t(n);
      } catch {
        return s;
      }
    };
  }(ie)), ie;
}
var De;
function gt() {
  return De || (De = 1, function(r) {
    const o = D(), i = $e(), t = we(), e = U(), n = Qe(), s = 7973, a = o.getBCHDigit(s);
    function c(g, d, v) {
      for (let y = 1; y <= 40; y++)
        if (d <= r.getCapacity(y, v, g))
          return y;
    }
    function l(g, d) {
      return e.getCharCountIndicator(g, d) + 4;
    }
    function u(g, d) {
      let v = 0;
      return g.forEach(function(y) {
        const P = l(y.mode, d);
        v += P + y.getBitsLength();
      }), v;
    }
    function x(g, d) {
      for (let v = 1; v <= 40; v++)
        if (u(g, v) <= r.getCapacity(v, d, e.MIXED))
          return v;
    }
    r.from = function(d, v) {
      return n.isValid(d) ? parseInt(d, 10) : v;
    }, r.getCapacity = function(d, v, y) {
      if (!n.isValid(d))
        throw new Error("Invalid QR Code version");
      typeof y > "u" && (y = e.BYTE);
      const P = o.getSymbolTotalCodewords(d), k = i.getTotalCodewordsCount(d, v), T = (P - k) * 8;
      if (y === e.MIXED) return T;
      const B = T - l(y, d);
      switch (y) {
        case e.NUMERIC:
          return Math.floor(B / 10 * 3);
        case e.ALPHANUMERIC:
          return Math.floor(B / 11 * 2);
        case e.KANJI:
          return Math.floor(B / 13);
        case e.BYTE:
        default:
          return Math.floor(B / 8);
      }
    }, r.getBestVersionForData = function(d, v) {
      let y;
      const P = t.from(v, t.M);
      if (Array.isArray(d)) {
        if (d.length > 1)
          return x(d, P);
        if (d.length === 0)
          return 1;
        y = d[0];
      } else
        y = d;
      return c(y.mode, y.getLength(), P);
    }, r.getEncodedBits = function(d) {
      if (!n.isValid(d) || d < 7)
        throw new Error("Invalid QR Code version");
      let v = d << 12;
      for (; o.getBCHDigit(v) - a >= 0; )
        v ^= s << o.getBCHDigit(v) - a;
      return d << 12 | v;
    };
  }(re)), re;
}
var ae = {}, Ue;
function pt() {
  if (Ue) return ae;
  Ue = 1;
  const r = D(), o = 1335, i = 21522, t = r.getBCHDigit(o);
  return ae.getEncodedBits = function(n, s) {
    const a = n.bit << 3 | s;
    let c = a << 10;
    for (; r.getBCHDigit(c) - t >= 0; )
      c ^= o << r.getBCHDigit(c) - t;
    return (a << 10 | c) ^ i;
  }, ae;
}
var ce = {}, le, _e;
function mt() {
  if (_e) return le;
  _e = 1;
  const r = U();
  function o(i) {
    this.mode = r.NUMERIC, this.data = i.toString();
  }
  return o.getBitsLength = function(t) {
    return 10 * Math.floor(t / 3) + (t % 3 ? t % 3 * 3 + 1 : 0);
  }, o.prototype.getLength = function() {
    return this.data.length;
  }, o.prototype.getBitsLength = function() {
    return o.getBitsLength(this.data.length);
  }, o.prototype.write = function(t) {
    let e, n, s;
    for (e = 0; e + 3 <= this.data.length; e += 3)
      n = this.data.substr(e, 3), s = parseInt(n, 10), t.put(s, 10);
    const a = this.data.length - e;
    a > 0 && (n = this.data.substr(e), s = parseInt(n, 10), t.put(s, a * 3 + 1));
  }, le = o, le;
}
var de, Fe;
function wt() {
  if (Fe) return de;
  Fe = 1;
  const r = U(), o = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    " ",
    "$",
    "%",
    "*",
    "+",
    "-",
    ".",
    "/",
    ":"
  ];
  function i(t) {
    this.mode = r.ALPHANUMERIC, this.data = t;
  }
  return i.getBitsLength = function(e) {
    return 11 * Math.floor(e / 2) + 6 * (e % 2);
  }, i.prototype.getLength = function() {
    return this.data.length;
  }, i.prototype.getBitsLength = function() {
    return i.getBitsLength(this.data.length);
  }, i.prototype.write = function(e) {
    let n;
    for (n = 0; n + 2 <= this.data.length; n += 2) {
      let s = o.indexOf(this.data[n]) * 45;
      s += o.indexOf(this.data[n + 1]), e.put(s, 11);
    }
    this.data.length % 2 && e.put(o.indexOf(this.data[n]), 6);
  }, de = i, de;
}
var ue, ze;
function yt() {
  if (ze) return ue;
  ze = 1;
  const r = U();
  function o(i) {
    this.mode = r.BYTE, typeof i == "string" ? this.data = new TextEncoder().encode(i) : this.data = new Uint8Array(i);
  }
  return o.getBitsLength = function(t) {
    return t * 8;
  }, o.prototype.getLength = function() {
    return this.data.length;
  }, o.prototype.getBitsLength = function() {
    return o.getBitsLength(this.data.length);
  }, o.prototype.write = function(i) {
    for (let t = 0, e = this.data.length; t < e; t++)
      i.put(this.data[t], 8);
  }, ue = o, ue;
}
var fe, Ve;
function bt() {
  if (Ve) return fe;
  Ve = 1;
  const r = U(), o = D();
  function i(t) {
    this.mode = r.KANJI, this.data = t;
  }
  return i.getBitsLength = function(e) {
    return e * 13;
  }, i.prototype.getLength = function() {
    return this.data.length;
  }, i.prototype.getBitsLength = function() {
    return i.getBitsLength(this.data.length);
  }, i.prototype.write = function(t) {
    let e;
    for (e = 0; e < this.data.length; e++) {
      let n = o.toSJIS(this.data[e]);
      if (n >= 33088 && n <= 40956)
        n -= 33088;
      else if (n >= 57408 && n <= 60351)
        n -= 49472;
      else
        throw new Error(
          "Invalid SJIS character: " + this.data[e] + `
Make sure your charset is UTF-8`
        );
      n = (n >>> 8 & 255) * 192 + (n & 255), t.put(n, 13);
    }
  }, fe = i, fe;
}
var he = { exports: {} }, je;
function Ct() {
  return je || (je = 1, function(r) {
    var o = {
      single_source_shortest_paths: function(i, t, e) {
        var n = {}, s = {};
        s[t] = 0;
        var a = o.PriorityQueue.make();
        a.push(t, 0);
        for (var c, l, u, x, g, d, v, y, P; !a.empty(); ) {
          c = a.pop(), l = c.value, x = c.cost, g = i[l] || {};
          for (u in g)
            g.hasOwnProperty(u) && (d = g[u], v = x + d, y = s[u], P = typeof s[u] > "u", (P || y > v) && (s[u] = v, a.push(u, v), n[u] = l));
        }
        if (typeof e < "u" && typeof s[e] > "u") {
          var k = ["Could not find a path from ", t, " to ", e, "."].join("");
          throw new Error(k);
        }
        return n;
      },
      extract_shortest_path_from_predecessor_list: function(i, t) {
        for (var e = [], n = t; n; )
          e.push(n), i[n], n = i[n];
        return e.reverse(), e;
      },
      find_path: function(i, t, e) {
        var n = o.single_source_shortest_paths(i, t, e);
        return o.extract_shortest_path_from_predecessor_list(
          n,
          e
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(i) {
          var t = o.PriorityQueue, e = {}, n;
          i = i || {};
          for (n in t)
            t.hasOwnProperty(n) && (e[n] = t[n]);
          return e.queue = [], e.sorter = i.sorter || t.default_sorter, e;
        },
        default_sorter: function(i, t) {
          return i.cost - t.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(i, t) {
          var e = { value: i, cost: t };
          this.queue.push(e), this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    r.exports = o;
  }(he)), he.exports;
}
var He;
function xt() {
  return He || (He = 1, function(r) {
    const o = U(), i = mt(), t = wt(), e = yt(), n = bt(), s = Ge(), a = D(), c = Ct();
    function l(k) {
      return unescape(encodeURIComponent(k)).length;
    }
    function u(k, T, B) {
      const E = [];
      let I;
      for (; (I = k.exec(B)) !== null; )
        E.push({
          data: I[0],
          index: I.index,
          mode: T,
          length: I[0].length
        });
      return E;
    }
    function x(k) {
      const T = u(s.NUMERIC, o.NUMERIC, k), B = u(s.ALPHANUMERIC, o.ALPHANUMERIC, k);
      let E, I;
      return a.isKanjiModeEnabled() ? (E = u(s.BYTE, o.BYTE, k), I = u(s.KANJI, o.KANJI, k)) : (E = u(s.BYTE_KANJI, o.BYTE, k), I = []), T.concat(B, E, I).sort(function(b, w) {
        return b.index - w.index;
      }).map(function(b) {
        return {
          data: b.data,
          mode: b.mode,
          length: b.length
        };
      });
    }
    function g(k, T) {
      switch (T) {
        case o.NUMERIC:
          return i.getBitsLength(k);
        case o.ALPHANUMERIC:
          return t.getBitsLength(k);
        case o.KANJI:
          return n.getBitsLength(k);
        case o.BYTE:
          return e.getBitsLength(k);
      }
    }
    function d(k) {
      return k.reduce(function(T, B) {
        const E = T.length - 1 >= 0 ? T[T.length - 1] : null;
        return E && E.mode === B.mode ? (T[T.length - 1].data += B.data, T) : (T.push(B), T);
      }, []);
    }
    function v(k) {
      const T = [];
      for (let B = 0; B < k.length; B++) {
        const E = k[B];
        switch (E.mode) {
          case o.NUMERIC:
            T.push([
              E,
              { data: E.data, mode: o.ALPHANUMERIC, length: E.length },
              { data: E.data, mode: o.BYTE, length: E.length }
            ]);
            break;
          case o.ALPHANUMERIC:
            T.push([
              E,
              { data: E.data, mode: o.BYTE, length: E.length }
            ]);
            break;
          case o.KANJI:
            T.push([
              E,
              { data: E.data, mode: o.BYTE, length: l(E.data) }
            ]);
            break;
          case o.BYTE:
            T.push([
              { data: E.data, mode: o.BYTE, length: l(E.data) }
            ]);
        }
      }
      return T;
    }
    function y(k, T) {
      const B = {}, E = { start: {} };
      let I = ["start"];
      for (let h = 0; h < k.length; h++) {
        const b = k[h], w = [];
        for (let f = 0; f < b.length; f++) {
          const S = b[f], p = "" + h + f;
          w.push(p), B[p] = { node: S, lastCount: 0 }, E[p] = {};
          for (let C = 0; C < I.length; C++) {
            const m = I[C];
            B[m] && B[m].node.mode === S.mode ? (E[m][p] = g(B[m].lastCount + S.length, S.mode) - g(B[m].lastCount, S.mode), B[m].lastCount += S.length) : (B[m] && (B[m].lastCount = S.length), E[m][p] = g(S.length, S.mode) + 4 + o.getCharCountIndicator(S.mode, T));
          }
        }
        I = w;
      }
      for (let h = 0; h < I.length; h++)
        E[I[h]].end = 0;
      return { map: E, table: B };
    }
    function P(k, T) {
      let B;
      const E = o.getBestModeForData(k);
      if (B = o.from(T, E), B !== o.BYTE && B.bit < E.bit)
        throw new Error('"' + k + '" cannot be encoded with mode ' + o.toString(B) + `.
 Suggested mode is: ` + o.toString(E));
      switch (B === o.KANJI && !a.isKanjiModeEnabled() && (B = o.BYTE), B) {
        case o.NUMERIC:
          return new i(k);
        case o.ALPHANUMERIC:
          return new t(k);
        case o.KANJI:
          return new n(k);
        case o.BYTE:
          return new e(k);
      }
    }
    r.fromArray = function(T) {
      return T.reduce(function(B, E) {
        return typeof E == "string" ? B.push(P(E, null)) : E.data && B.push(P(E.data, E.mode)), B;
      }, []);
    }, r.fromString = function(T, B) {
      const E = x(T, a.isKanjiModeEnabled()), I = v(E), h = y(I, B), b = c.find_path(h.map, "start", "end"), w = [];
      for (let f = 1; f < b.length - 1; f++)
        w.push(h.table[b[f]].node);
      return r.fromArray(d(w));
    }, r.rawSplit = function(T) {
      return r.fromArray(
        x(T, a.isKanjiModeEnabled())
      );
    };
  }(ce)), ce;
}
var Je;
function Et() {
  if (Je) return $;
  Je = 1;
  const r = D(), o = we(), i = st(), t = at(), e = ct(), n = lt(), s = dt(), a = $e(), c = ht(), l = gt(), u = pt(), x = U(), g = xt();
  function d(h, b) {
    const w = h.size, f = n.getPositions(b);
    for (let S = 0; S < f.length; S++) {
      const p = f[S][0], C = f[S][1];
      for (let m = -1; m <= 7; m++)
        if (!(p + m <= -1 || w <= p + m))
          for (let A = -1; A <= 7; A++)
            C + A <= -1 || w <= C + A || (m >= 0 && m <= 6 && (A === 0 || A === 6) || A >= 0 && A <= 6 && (m === 0 || m === 6) || m >= 2 && m <= 4 && A >= 2 && A <= 4 ? h.set(p + m, C + A, !0, !0) : h.set(p + m, C + A, !1, !0));
    }
  }
  function v(h) {
    const b = h.size;
    for (let w = 8; w < b - 8; w++) {
      const f = w % 2 === 0;
      h.set(w, 6, f, !0), h.set(6, w, f, !0);
    }
  }
  function y(h, b) {
    const w = e.getPositions(b);
    for (let f = 0; f < w.length; f++) {
      const S = w[f][0], p = w[f][1];
      for (let C = -2; C <= 2; C++)
        for (let m = -2; m <= 2; m++)
          C === -2 || C === 2 || m === -2 || m === 2 || C === 0 && m === 0 ? h.set(S + C, p + m, !0, !0) : h.set(S + C, p + m, !1, !0);
    }
  }
  function P(h, b) {
    const w = h.size, f = l.getEncodedBits(b);
    let S, p, C;
    for (let m = 0; m < 18; m++)
      S = Math.floor(m / 3), p = m % 3 + w - 8 - 3, C = (f >> m & 1) === 1, h.set(S, p, C, !0), h.set(p, S, C, !0);
  }
  function k(h, b, w) {
    const f = h.size, S = u.getEncodedBits(b, w);
    let p, C;
    for (p = 0; p < 15; p++)
      C = (S >> p & 1) === 1, p < 6 ? h.set(p, 8, C, !0) : p < 8 ? h.set(p + 1, 8, C, !0) : h.set(f - 15 + p, 8, C, !0), p < 8 ? h.set(8, f - p - 1, C, !0) : p < 9 ? h.set(8, 15 - p - 1 + 1, C, !0) : h.set(8, 15 - p - 1, C, !0);
    h.set(f - 8, 8, 1, !0);
  }
  function T(h, b) {
    const w = h.size;
    let f = -1, S = w - 1, p = 7, C = 0;
    for (let m = w - 1; m > 0; m -= 2)
      for (m === 6 && m--; ; ) {
        for (let A = 0; A < 2; A++)
          if (!h.isReserved(S, m - A)) {
            let M = !1;
            C < b.length && (M = (b[C] >>> p & 1) === 1), h.set(S, m - A, M), p--, p === -1 && (C++, p = 7);
          }
        if (S += f, S < 0 || w <= S) {
          S -= f, f = -f;
          break;
        }
      }
  }
  function B(h, b, w) {
    const f = new i();
    w.forEach(function(A) {
      f.put(A.mode.bit, 4), f.put(A.getLength(), x.getCharCountIndicator(A.mode, h)), A.write(f);
    });
    const S = r.getSymbolTotalCodewords(h), p = a.getTotalCodewordsCount(h, b), C = (S - p) * 8;
    for (f.getLengthInBits() + 4 <= C && f.put(0, 4); f.getLengthInBits() % 8 !== 0; )
      f.putBit(0);
    const m = (C - f.getLengthInBits()) / 8;
    for (let A = 0; A < m; A++)
      f.put(A % 2 ? 17 : 236, 8);
    return E(f, h, b);
  }
  function E(h, b, w) {
    const f = r.getSymbolTotalCodewords(b), S = a.getTotalCodewordsCount(b, w), p = f - S, C = a.getBlocksCount(b, w), m = f % C, A = C - m, M = Math.floor(f / C), z = Math.floor(p / C), Xe = z + 1, ye = M - z, et = new c(ye);
    let J = 0;
    const j = new Array(C), be = new Array(C);
    let K = 0;
    const tt = new Uint8Array(h.buffer);
    for (let _ = 0; _ < C; _++) {
      const Y = _ < A ? z : Xe;
      j[_] = tt.slice(J, J + Y), be[_] = et.encode(j[_]), J += Y, K = Math.max(K, Y);
    }
    const O = new Uint8Array(f);
    let Ce = 0, L, N;
    for (L = 0; L < K; L++)
      for (N = 0; N < C; N++)
        L < j[N].length && (O[Ce++] = j[N][L]);
    for (L = 0; L < ye; L++)
      for (N = 0; N < C; N++)
        O[Ce++] = be[N][L];
    return O;
  }
  function I(h, b, w, f) {
    let S;
    if (Array.isArray(h))
      S = g.fromArray(h);
    else if (typeof h == "string") {
      let M = b;
      if (!M) {
        const z = g.rawSplit(h);
        M = l.getBestVersionForData(z, w);
      }
      S = g.fromString(h, M || 40);
    } else
      throw new Error("Invalid data");
    const p = l.getBestVersionForData(S, w);
    if (!p)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!b)
      b = p;
    else if (b < p)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + p + `.
`
      );
    const C = B(b, w, S), m = r.getSymbolSize(b), A = new t(m);
    return d(A, b), v(A), y(A, b), k(A, w, 0), b >= 7 && P(A, b), T(A, C), isNaN(f) && (f = s.getBestMask(
      A,
      k.bind(null, A, w)
    )), s.applyMask(f, A), k(A, w, f), {
      modules: A,
      version: b,
      errorCorrectionLevel: w,
      maskPattern: f,
      segments: S
    };
  }
  return $.create = function(b, w) {
    if (typeof b > "u" || b === "")
      throw new Error("No input text");
    let f = o.M, S, p;
    return typeof w < "u" && (f = o.from(w.errorCorrectionLevel, o.M), S = l.from(w.version), p = s.from(w.maskPattern), w.toSJISFunc && r.setToSJISFunction(w.toSJISFunc)), I(b, S, f, p);
  }, $;
}
var ge = {}, pe = {}, Ke;
function Ze() {
  return Ke || (Ke = 1, function(r) {
    function o(i) {
      if (typeof i == "number" && (i = i.toString()), typeof i != "string")
        throw new Error("Color should be defined as hex string");
      let t = i.slice().replace("#", "").split("");
      if (t.length < 3 || t.length === 5 || t.length > 8)
        throw new Error("Invalid hex color: " + i);
      (t.length === 3 || t.length === 4) && (t = Array.prototype.concat.apply([], t.map(function(n) {
        return [n, n];
      }))), t.length === 6 && t.push("F", "F");
      const e = parseInt(t.join(""), 16);
      return {
        r: e >> 24 & 255,
        g: e >> 16 & 255,
        b: e >> 8 & 255,
        a: e & 255,
        hex: "#" + t.slice(0, 6).join("")
      };
    }
    r.getOptions = function(t) {
      t || (t = {}), t.color || (t.color = {});
      const e = typeof t.margin > "u" || t.margin === null || t.margin < 0 ? 4 : t.margin, n = t.width && t.width >= 21 ? t.width : void 0, s = t.scale || 4;
      return {
        width: n,
        scale: n ? 4 : s,
        margin: e,
        color: {
          dark: o(t.color.dark || "#000000ff"),
          light: o(t.color.light || "#ffffffff")
        },
        type: t.type,
        rendererOpts: t.rendererOpts || {}
      };
    }, r.getScale = function(t, e) {
      return e.width && e.width >= t + e.margin * 2 ? e.width / (t + e.margin * 2) : e.scale;
    }, r.getImageWidth = function(t, e) {
      const n = r.getScale(t, e);
      return Math.floor((t + e.margin * 2) * n);
    }, r.qrToImageData = function(t, e, n) {
      const s = e.modules.size, a = e.modules.data, c = r.getScale(s, n), l = Math.floor((s + n.margin * 2) * c), u = n.margin * c, x = [n.color.light, n.color.dark];
      for (let g = 0; g < l; g++)
        for (let d = 0; d < l; d++) {
          let v = (g * l + d) * 4, y = n.color.light;
          if (g >= u && d >= u && g < l - u && d < l - u) {
            const P = Math.floor((g - u) / c), k = Math.floor((d - u) / c);
            y = x[a[P * s + k] ? 1 : 0];
          }
          t[v++] = y.r, t[v++] = y.g, t[v++] = y.b, t[v] = y.a;
        }
    };
  }(pe)), pe;
}
var Oe;
function St() {
  return Oe || (Oe = 1, function(r) {
    const o = Ze();
    function i(e, n, s) {
      e.clearRect(0, 0, n.width, n.height), n.style || (n.style = {}), n.height = s, n.width = s, n.style.height = s + "px", n.style.width = s + "px";
    }
    function t() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    r.render = function(n, s, a) {
      let c = a, l = s;
      typeof c > "u" && (!s || !s.getContext) && (c = s, s = void 0), s || (l = t()), c = o.getOptions(c);
      const u = o.getImageWidth(n.modules.size, c), x = l.getContext("2d"), g = x.createImageData(u, u);
      return o.qrToImageData(g.data, n, c), i(x, l, u), x.putImageData(g, 0, 0), l;
    }, r.renderToDataURL = function(n, s, a) {
      let c = a;
      typeof c > "u" && (!s || !s.getContext) && (c = s, s = void 0), c || (c = {});
      const l = r.render(n, s, c), u = c.type || "image/png", x = c.rendererOpts || {};
      return l.toDataURL(u, x.quality);
    };
  }(ge)), ge;
}
var me = {}, Ye;
function vt() {
  if (Ye) return me;
  Ye = 1;
  const r = Ze();
  function o(e, n) {
    const s = e.a / 255, a = n + '="' + e.hex + '"';
    return s < 1 ? a + " " + n + '-opacity="' + s.toFixed(2).slice(1) + '"' : a;
  }
  function i(e, n, s) {
    let a = e + n;
    return typeof s < "u" && (a += " " + s), a;
  }
  function t(e, n, s) {
    let a = "", c = 0, l = !1, u = 0;
    for (let x = 0; x < e.length; x++) {
      const g = Math.floor(x % n), d = Math.floor(x / n);
      !g && !l && (l = !0), e[x] ? (u++, x > 0 && g > 0 && e[x - 1] || (a += l ? i("M", g + s, 0.5 + d + s) : i("m", c, 0), c = 0, l = !1), g + 1 < n && e[x + 1] || (a += i("h", u), u = 0)) : c++;
    }
    return a;
  }
  return me.render = function(n, s, a) {
    const c = r.getOptions(s), l = n.modules.size, u = n.modules.data, x = l + c.margin * 2, g = c.color.light.a ? "<path " + o(c.color.light, "fill") + ' d="M0 0h' + x + "v" + x + 'H0z"/>' : "", d = "<path " + o(c.color.dark, "stroke") + ' d="' + t(u, l, c.margin) + '"/>', v = 'viewBox="0 0 ' + x + " " + x + '"', P = '<svg xmlns="http://www.w3.org/2000/svg" ' + (c.width ? 'width="' + c.width + '" height="' + c.width + '" ' : "") + v + ' shape-rendering="crispEdges">' + g + d + `</svg>
`;
    return typeof a == "function" && a(null, P), P;
  }, me;
}
var We;
function kt() {
  if (We) return F;
  We = 1;
  const r = it(), o = Et(), i = St(), t = vt();
  function e(n, s, a, c, l) {
    const u = [].slice.call(arguments, 1), x = u.length, g = typeof u[x - 1] == "function";
    if (!g && !r())
      throw new Error("Callback required as last argument");
    if (g) {
      if (x < 2)
        throw new Error("Too few arguments provided");
      x === 2 ? (l = a, a = s, s = c = void 0) : x === 3 && (s.getContext && typeof l > "u" ? (l = c, c = void 0) : (l = c, c = a, a = s, s = void 0));
    } else {
      if (x < 1)
        throw new Error("Too few arguments provided");
      return x === 1 ? (a = s, s = c = void 0) : x === 2 && !s.getContext && (c = a, a = s, s = void 0), new Promise(function(d, v) {
        try {
          const y = o.create(a, c);
          d(n(y, s, c));
        } catch (y) {
          v(y);
        }
      });
    }
    try {
      const d = o.create(a, c);
      l(null, n(d, s, c));
    } catch (d) {
      l(d);
    }
  }
  return F.create = o.create, F.toCanvas = e.bind(null, i.render), F.toDataURL = e.bind(null, i.renderToDataURL), F.toString = e.bind(null, function(n, s, a) {
    return t.render(n, a);
  }), F;
}
var Bt = kt();
const At = /* @__PURE__ */ rt(Bt);
class Tt {
  constructor(o = {}) {
    this.config = {
      amount: o.amount || 1,
      container: o.container || document.body,
      serverUrl: o.serverUrl || "http://localhost:3000",
      wsUrl: o.wsUrl || "ws://localhost:8080"
    }, this.init(), this.selectedValue = null, this.ws = null;
  }
  init() {
    this.container = document.createElement("div"), this.shadow = this.container.attachShadow({ mode: "closed" });
    const o = document.createElement("style");
    o.textContent = ot, this.shadow.appendChild(o), this.shadow.innerHTML += nt, this.config.container.appendChild(this.container), this.setupEventListeners();
    const i = this.shadow.querySelector(".dropdown-options");
    i.getBoundingClientRect(), i.classList.add("dropdown-init");
  }
  setupWebSocket(o) {
    if (!o) {
      console.error("PaymentId is required for WebSocket setup");
      return;
    }
    this.ws && this.ws.close(), this.ws = new WebSocket(this.config.wsUrl), this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        type: "subscribe_payment",
        paymentId: o
      }));
    }, this.ws.onmessage = (i) => {
      JSON.parse(i.data).type === "payment_completed" && (this.goToScreen3(), this.cleanupWebSocket());
    }, this.ws.onerror = (i) => {
      console.error("WebSocket error:", i);
    };
  }
  setupEventListeners() {
    const o = this.shadow.querySelector(".dropdown"), i = this.shadow.querySelector("#customSelect"), t = this.shadow.querySelectorAll(".option"), e = this.shadow.querySelector(".selected"), n = this.shadow.querySelector("#nextButton"), s = t.length;
    this.shadow.host.style.setProperty("--num-options", s), i.addEventListener("click", (a) => {
      a.stopPropagation(), o.classList.toggle("open");
    }), t.forEach((a) => {
      a.addEventListener("click", () => {
        const c = a.querySelector(".option-main").cloneNode(!0), l = a.querySelector(".option-tokens").cloneNode(!0);
        this.selectedValue = a.dataset.value, n && (n.classList.remove("disabled"), n.disabled = !1), e.innerHTML = "", e.appendChild(c), e.appendChild(l), o.classList.remove("open");
      });
    }), document.addEventListener("click", (a) => {
      o.contains(a.target) || o.classList.remove("open");
    }), n && n.addEventListener("click", () => this.goToScreen2());
  }
  // Screen management
  async goToScreen2() {
    if (!this.selectedValue) {
      alert("Please select a payment method!");
      return;
    }
    try {
      const o = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chain: this.selectedValue,
          amount: this.config.amount
        })
      });
      if (!o.ok) throw new Error("Payment request failed");
      const { address: i } = await o.json(), t = i, e = await At.toDataURL(i, {
        width: 120,
        margin: 1
      });
      this.setupWebSocket(t), this.ws.onopen = () => {
        this.ws.send(JSON.stringify({
          type: "subscribe_payment",
          paymentId: t
        }));
      }, this.ws.onmessage = (y) => {
        JSON.parse(y.data).type === "payment_completed" && this.goToScreen3();
      };
      const n = this.shadow.querySelector("#screen1"), s = this.shadow.querySelector("#screen2"), a = this.shadow.querySelectorAll(".solana-chain"), c = this.shadow.querySelectorAll(".base-chain"), l = this.shadow.querySelector("#qrCode"), u = this.shadow.querySelector("#walletAddress"), x = this.shadow.querySelector("#solana-amount"), g = this.shadow.querySelector("#base-amount"), d = this.shadow.querySelector("#addressContainer");
      n.classList.add("hidden"), s.classList.remove("hidden"), a.forEach((y) => y.classList.add("hidden")), c.forEach((y) => y.classList.add("hidden")), this.selectedValue === "solana" ? a.forEach((y) => y.classList.remove("hidden")) : this.selectedValue === "base" && c.forEach((y) => y.classList.remove("hidden"));
      const v = this.formatAmount(this.config.amount);
      x.textContent = `$ ${v}`, g.textContent = `$ ${v}`, this.setupCopyToClipboard(), this.setupCopyAmount(), l.alt = "Payment QR Code", l.src = e, this.selectedValue === "solana" ? (u.innerHTML = `<b>${i}</b>`, d.textContent = "Solana Address:") : (u.innerHTML = `<b>${i}</b>`, d.textContent = "Base Address:"), this.startTimer();
    } catch (o) {
      console.error("Payment creation failed:", o), alert("Failed to create payment. Please try again.");
    }
  }
  goToScreen3() {
    this.shadow.querySelector("#screen2").classList.add("hidden"), this.shadow.querySelector("#screen3").classList.remove("hidden"), this.cleanupWebSocket();
  }
  goToScreen4() {
    this.shadow.querySelector("#screen2").classList.add("hidden"), this.shadow.querySelector("#screen4").classList.remove("hidden"), cleanupWebSocket();
  }
  /** Helper Functions **/
  setupCopyToClipboard() {
    const o = this.shadow.querySelector("#walletAddress");
    o.addEventListener("click", async () => {
      const i = o.textContent;
      try {
        await navigator.clipboard.writeText(i);
        const t = o.textContent;
        o.classList.add("copied"), o.textContent = "Copied!", setTimeout(() => {
          o.textContent = t, o.classList.remove("copied");
        }, 1e3);
      } catch (t) {
        console.error("Failed to copy:", t);
      }
    });
  }
  setupCopyAmount() {
    const o = this.shadow.querySelector(".token-icons");
    o.addEventListener("click", async () => {
      const t = o.querySelector(".payment-amount").textContent.replace(/[$\s]/g, "");
      try {
        await navigator.clipboard.writeText(t), o.classList.add("copied"), setTimeout(() => {
          o.classList.remove("copied");
        }, 1e3);
      } catch (e) {
        console.error("Failed to copy:", e);
      }
    });
  }
  formatAmount(o) {
    return o < 10 ? o.toFixed(2) : o.toFixed(1);
  }
  cleanupWebSocket() {
    this.ws && (this.ws.close(), this.ws = null);
  }
  // Timer logic
  startTimer() {
    const o = this.shadow.querySelector("#timer");
    let i = 10 * 60;
    const t = setInterval(() => {
      const e = Math.floor(i / 60), n = i % 60;
      o.textContent = `Time Left: ${e}:${n < 10 ? "0" + n : n}`, i--, i < 0 && (clearInterval(t), this.shadow.querySelector("#screen2").classList.contains("hidden") || goToScreen4());
    }, 1e3);
  }
}
window.PaymentWidget = Tt;
