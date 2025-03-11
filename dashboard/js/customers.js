document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const tableBody = document.getElementById('customers-table-body');
    const loading = document.getElementById('loading-indicator');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('customer-search');
    const statusFilter = document.getElementById('payment-status-filter');
    const dateFilter = document.getElementById('date-filter');
    
    // Customer data (will be populated from transactions)
    let customers = [];
    
    // Initialize the table
    function initCustomersTable() {
        // Check if data is already loaded in home.js
        if (window.transactionsDataLoaded && window.sharedTransactionData) {
            processTransactionsIntoCustomers(window.sharedTransactionData);
        } else {
            // If data isn't loaded yet, wait for it
            loading.style.display = 'flex';
            
            // Listen for the event from home.js that signals data is loaded
            window.addEventListener('transactionsLoaded', function() {
                processTransactionsIntoCustomers(window.sharedTransactionData);
            });
            
            // Fallback timeout in case the event never fires
            setTimeout(() => {
                if (!window.transactionsDataLoaded) {
                    // If data wasn't loaded after 5 seconds, fetch it directly
                    fetchTransactionsDirectly();
                }
            }, 5000);
        }

        // Set up event listeners
        searchInput.addEventListener('input', filterCustomers);
        statusFilter.addEventListener('change', filterCustomers);
        dateFilter.addEventListener('change', filterCustomers);
    }
    
    // Process transaction data into customer records
    function processTransactionsIntoCustomers(transactions) {
        // Reset customers array
        customers = [];
        
        // Early exit if no transactions
        if (!transactions || !transactions.length) {
            loading.style.display = 'none';
            emptyState.classList.remove('hidden');
            return;
        }
        
        // Group transactions by customer ID
        const customerMap = {};
        
        transactions.forEach(transaction => {
            // Get customer ID (use transaction.customer or fallback to a placeholder)
            const customerId = transaction.customerId || transaction.customer || 'anonymous';
            
            // Create customer entry if it doesn't exist
            if (!customerMap[customerId]) {
                customerMap[customerId] = {
                    id: customerId,
                    totalPayments: 0,
                    totalAmount: 0,
                    latestPayment: new Date(0),  // Start with oldest possible date
                    status: '',
                    payments: []
                };
            }
            
            // Add this transaction to the customer's payments
            customerMap[customerId].payments.push({
                id: transaction.id,
                amount: parseFloat(transaction.amount),
                date: transaction.date,
                status: transaction.status,
                chain: transaction.chain || 'Unknown',
                wallet: transaction.wallet || 'N/A',
                failureReason: transaction.failureReason || ''
            });
            
            // Update customer metrics
            customerMap[customerId].totalPayments++;
            // Only add to totalAmount if the transaction is completed
            if (transaction.status === 'completed') {
                customerMap[customerId].totalAmount += parseFloat(transaction.amount);
            }
            
            // Update latest payment date if this transaction is newer
            if (transaction.date > customerMap[customerId].latestPayment) {
                customerMap[customerId].latestPayment = transaction.date;
                customerMap[customerId].status = transaction.status;
            }
        });
        
        // Convert map to array
        customers = Object.values(customerMap);
        
        // Sort customers by latest payment date (newest first)
        customers.sort((a, b) => b.latestPayment - a.latestPayment);
        
        // Sort each customer's payments by date (newest first)
        customers.forEach(customer => {
            customer.payments.sort((a, b) => b.date - a.date);
        });
        
        // Render the customer table
        renderCustomers(customers);
        loading.style.display = 'none';
    }
    
    // Direct API call if needed (fallback)
    async function fetchTransactionsDirectly() {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const userId = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).id : null;
            
            if (!token) {
                console.error('No authentication token found');
                loading.style.display = 'none';
                emptyState.classList.remove('hidden');
                emptyState.querySelector('h3').textContent = 'Authentication Required';
                emptyState.querySelector('p').textContent = 'Please log in to view customer data.';
                return;
            }
            
            // Fetch the data directly
            const response = await fetch(`${API_URL}/api/transactions/all?vendorID=${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.transactions && Array.isArray(data.transactions)) {
                // Convert date strings to Date objects
                const transactions = data.transactions.map(transaction => ({
                    ...transaction,
                    date: new Date(transaction.date)
                }));
                
                // Process into customers
                processTransactionsIntoCustomers(transactions);
            } else {
                throw new Error('Invalid data structure received from API');
            }
        } catch (error) {
            console.error('Error fetching transaction data:', error);
            loading.style.display = 'none';
            emptyState.classList.remove('hidden');
            emptyState.querySelector('h3').textContent = 'Error loading data';
            emptyState.querySelector('p').textContent = 'Could not connect to the server. Please try again later.';
        }
    }

    // Render customers table (keep your existing function)
    function renderCustomers(customers) {
        tableBody.innerHTML = '';
        
        customers.forEach(customer => {
            // Create main customer row
            const row = document.createElement('tr');
            row.className = 'customer-row';
            row.dataset.customerId = customer.id;
            
            // Format the date
            const paymentDate = customer.latestPayment;
            const formattedDate = paymentDate.toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
            });
            
            row.innerHTML = `
                <td class="expand-column">
                    <button class="expand-button" aria-label="Expand details">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </td>
                <td>${customer.id}</td>
                <td>${customer.totalPayments}</td>
                <td>$${customer.totalAmount.toFixed(2)}</td>
                <td>${formattedDate}</td>
                <td>
                    <span class="status-badge status-${customer.status}">
                        ${capitalizeFirstLetter(customer.status)}
                    </span>
                </td>
            `;
            
            // Add event listener for row expansion
            const expandButton = row.querySelector('.expand-button');
            expandButton.addEventListener('click', function() {
                togglePaymentDetails(customer.id);
                this.classList.toggle('expanded');
                row.classList.toggle('expanded-row');
            });
            
            tableBody.appendChild(row);
            
            // Create details row (hidden by default)
            const detailsRow = document.createElement('tr');
            detailsRow.className = 'details-row';
            detailsRow.dataset.customerId = customer.id;
            detailsRow.innerHTML = `
                <td colspan="6">
                    <div class="payment-details">
                        <h4>Payment History</h4>
                        <ul class="payment-list">
                            ${renderPaymentItems(customer.payments)}
                        </ul>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(detailsRow);
        });
        
        // Set up copy functionality
        setupCopyButtons();
    }

    // Create HTML for payment items
    function renderPaymentItems(payments) {
        return payments.map(payment => {
            const paymentDate = new Date(payment.date);
            const formattedDate = paymentDate.toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            });
            
            let additionalInfo = '';
            if (payment.status === 'expired' && payment.failureReason) {
                additionalInfo = `
                    <div class="payment-info-row">
                        <span class="info-label">Failure Reason:</span>
                        <span class="info-value">${payment.failureReason}</span>
                    </div>
                `;
            }
            
            return `
                <li class="payment-item">
                    <div class="payment-header">
                        <span class="payment-amount">$${payment.amount.toFixed(2)}</span>
                        <span class="payment-date">${formattedDate}</span>
                    </div>
                    <div class="payment-info">
                        <div class="payment-info-row">
                            <span class="info-label">Payment ID:</span>
                            <span class="info-value">${payment.id}
                                <i class="fas fa-copy copy-value" data-copy="${payment.id}" title="Copy Payment ID"></i>
                            </span>
                        </div>
                        <div class="payment-info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value">
                                <span class="status-badge status-${payment.status}">
                                    ${capitalizeFirstLetter(payment.status)}
                                </span>
                            </span>
                        </div>
                        <div class="payment-info-row">
                            <span class="info-label">Chain:</span>
                            <span class="info-value">${payment.chain}</span>
                        </div>
                        <div class="payment-info-row">
                            <span class="info-label">Wallet:</span>
                            <span class="info-value">
                                ${truncateMiddle(payment.wallet, 8)}
                                <i class="fas fa-copy copy-value" data-copy="${payment.wallet}" title="Copy Wallet Address"></i>
                            </span>
                        </div>
                        ${additionalInfo}
                    </div>
                </li>
            `;
        }).join('');
    }

    // Toggle payment details visibility
    function togglePaymentDetails(customerId) {
        const detailsRow = document.querySelector(`.details-row[data-customer-id="${customerId}"]`);
        detailsRow.classList.toggle('details-visible');
    }
    
    // Set up copy functionality for addresses and IDs
    function setupCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-value');
        copyButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const textToCopy = this.getAttribute('data-copy');
                copyToClipboard(textToCopy, this);
            });
        });
    }
    
    // Copy text to clipboard
    function copyToClipboard(text, button) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            
            // Visual feedback
            const originalIcon = button.className;
            button.className = 'fas fa-check copy-value';
            button.style.color = 'var(--primary-color)';
            
            // Reset after 2 seconds
            setTimeout(() => {
                button.className = originalIcon;
                button.style.color = '';
            }, 1500);
            
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        document.body.removeChild(textarea);
    }
    
    // Filter customers based on search and filters
    function filterCustomers() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;
        
        let filteredCustomers = [...customers];
        
        // Apply search filter
        if (searchTerm) {
            filteredCustomers = filteredCustomers.filter(customer => 
                customer.id.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply status filter
        if (statusValue !== 'all') {
            filteredCustomers = filteredCustomers.filter(customer => 
                customer.status === statusValue
            );
        }
        
        // Apply date filter
        if (dateValue !== 'all') {
            const now = new Date();
            let cutoffDate;
            
            if (dateValue === 'today') {
                cutoffDate = new Date(now.setHours(0, 0, 0, 0));
            } else if (dateValue === 'week') {
                cutoffDate = new Date(now.setDate(now.getDate() - 7));
            } else if (dateValue === 'month') {
                cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
            } else if (dateValue === 'quarter') {
                cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
            }
            
            filteredCustomers = filteredCustomers.filter(customer => 
                new Date(customer.latestPayment) >= cutoffDate
            );
        }
        
        // Show empty state or render filtered customers
        if (filteredCustomers.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            renderCustomers(filteredCustomers);
        }
    }
    
    // Helper functions
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function truncateMiddle(str, visibleChars) {
        if (str.length <= visibleChars * 2) return str;
        return `${str.substr(0, visibleChars)}...${str.substr(str.length - visibleChars, visibleChars)}`;
    }

    // Initialize the table when the page loads
    initCustomersTable();
    
    // Listen for tab activation
    window.addEventListener('customersTabActive', function() {
        if (window.sharedTransactionData && !customers.length) {
            processTransactionsIntoCustomers(window.sharedTransactionData);
        }
    });
});