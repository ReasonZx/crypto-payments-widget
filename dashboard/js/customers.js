document.addEventListener('DOMContentLoaded', function() {
    // Sample customer data (in a real app, this would come from your API)
    const sampleCustomers = [
        {
            id: 'cust_001',
            totalPayments: 5,
            totalAmount: 1250.75,
            latestPayment: '2025-02-25T14:30:00',
            status: 'completed',
            payments: [
                {
                    id: 'pay_12345',
                    amount: 500.00,
                    date: '2025-02-25T14:30:00',
                    status: 'completed',
                    transactionId: '0x1234567890abcdef1234567890abcdef12345678',
                    chain: 'Solana',
                    wallet: 'CpFE4cD32xqex3NdZRfYm1mKbKKp1KsDsZZPZnzhe1QS'
                },
                {
                    id: 'pay_12344',
                    amount: 350.75,
                    date: '2025-02-20T11:15:00',
                    status: 'completed',
                    transactionId: '0xabcdef1234567890abcdef1234567890abcdef12',
                    chain: 'Base',
                    wallet: '0x1234567890abcdef1234567890abcdef12345678'
                },
                {
                    id: 'pay_12343',
                    amount: 400.00,
                    date: '2025-02-15T09:45:00',
                    status: 'completed',
                    transactionId: '0x7890abcdef1234567890abcdef1234567890abcd',
                    chain: 'Solana',
                    wallet: 'CpFE4cD32xqex3NdZRfYm1mKbKKp1KsDsZZPZnzhe1QS'
                }
            ]
        },
        {
            id: 'cust_002',
            totalPayments: 2,
            totalAmount: 750.25,
            latestPayment: '2025-02-24T10:15:00',
            status: 'pending',
            payments: [
                {
                    id: 'pay_23456',
                    amount: 500.25,
                    date: '2025-02-24T10:15:00',
                    status: 'pending',
                    transactionId: 'pending',
                    chain: 'Solana',
                    wallet: 'DeFi4cD32xqex3NdZRfYm1mKbKKp1KsDsZZPZnzhe1QS'
                },
                {
                    id: 'pay_23455',
                    amount: 250.00,
                    date: '2025-02-18T16:30:00',
                    status: 'completed',
                    transactionId: '0xdef1234567890abcdef1234567890abcdef12345',
                    chain: 'Base',
                    wallet: '0x7890abcdef1234567890abcdef1234567890abcdef'
                }
            ]
        },
        {
            id: 'cust_003',
            totalPayments: 1,
            totalAmount: 125.50,
            latestPayment: '2025-02-22T08:45:00',
            status: 'failed',
            payments: [
                {
                    id: 'pay_34567',
                    amount: 125.50,
                    date: '2025-02-22T08:45:00',
                    status: 'failed',
                    transactionId: 'failed',
                    chain: 'Solana',
                    wallet: 'SoLFE4cD32xqex3NdZRfYm1mKbKKp1KsDsZZPZnzhe1QS',
                    failureReason: 'Insufficient wallet balance'
                }
            ]
        }
    ];

    // DOM elements
    const tableBody = document.getElementById('customers-table-body');
    const loading = document.getElementById('loading-indicator');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('customer-search');
    const statusFilter = document.getElementById('payment-status-filter');
    const dateFilter = document.getElementById('date-filter');

    // Initialize the table
    function initCustomersTable() {
        // Simulate API loading delay
        setTimeout(() => {
            if (sampleCustomers.length === 0) {
                loading.style.display = 'none';
                emptyState.classList.remove('hidden');
            } else {
                renderCustomers(sampleCustomers);
                loading.style.display = 'none';
            }
        }, 1000);

        // Set up event listeners
        searchInput.addEventListener('input', filterCustomers);
        statusFilter.addEventListener('change', filterCustomers);
        dateFilter.addEventListener('change', filterCustomers);
    }

    // Render customers table
    function renderCustomers(customers) {
        tableBody.innerHTML = '';
        
        customers.forEach(customer => {
            // Create main customer row
            const row = document.createElement('tr');
            row.className = 'customer-row';
            row.dataset.customerId = customer.id;
            
            // Format the date
            const paymentDate = new Date(customer.latestPayment);
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
            if (payment.status === 'failed' && payment.failureReason) {
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
                            <span class="info-label">Transaction ID:</span>
                            <span class="info-value">
                                ${payment.transactionId === 'pending' || payment.transactionId === 'failed' 
                                    ? payment.transactionId 
                                    : `${truncateMiddle(payment.transactionId, 8)}
                                       <i class="fas fa-copy copy-value" data-copy="${payment.transactionId}" title="Copy Transaction ID"></i>`
                                }
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
        
        let filteredCustomers = [...sampleCustomers];
        
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
});