document.addEventListener('DOMContentLoaded', function() {
    // ====== Tab switching functionality ======
    const tabButtons = document.querySelectorAll('.home-tab-btn');
    const tabContents = document.querySelectorAll('.home-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // If analytics tab, make sure charts are properly sized
            if (tabId === 'analytics') {
                window.dispatchEvent(new Event('resize'));
            }
        });
    });

    // ====== Time period filter functionality ======
    const periodButtons = document.querySelectorAll('.period-btn');
    // Track the currently selected period
    let currentPeriod = '7d'; // Default to 7 days
    
    periodButtons.forEach(button => {
        button.addEventListener('click', () => {
            periodButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentPeriod = button.getAttribute('data-period');
            updateDashboardData(currentPeriod);
        });
    });

    // Date range picker functionality
    const dateRangeToggle = document.querySelector('.date-range-toggle');
    const dateRangeDropdown = document.querySelector('.date-range-dropdown');
    
    if (dateRangeToggle && dateRangeDropdown) {
        dateRangeToggle.addEventListener('click', () => {
            dateRangeDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dateRangeToggle.contains(e.target) && !dateRangeDropdown.contains(e.target)) {
                dateRangeDropdown.classList.add('hidden');
            }
        });
        
        // Apply button
        const applyDateRangeBtn = document.querySelector('.apply-date-range');
        applyDateRangeBtn.addEventListener('click', () => {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            
            if (startDate && endDate) {
                updateDashboardData('custom', { startDate, endDate });
                dateRangeDropdown.classList.add('hidden');
                
                // Update UI to show custom range is selected
                periodButtons.forEach(btn => btn.classList.remove('active'));
                currentPeriod = 'custom';
            }
        });
    }

    // ====== Analytics Charts Setup ======
    // Set color scheme for charts
    const colorPalette = {
        primary: '#4dbb9a',    // Green - for USDT on Solana
        secondary: '#2C7BE5',  // Blue - for USDC on Base
        tertiary: '#9D7BD8',   // Purple - for USDC on Solana
        background: 'rgba(77, 187, 154, 0.1)',
        borderColor: '#e2e8f0',
        textColor: '#718096'
    };

    // Payment volume chart
    let paymentsChart;
    function setupPaymentVolumeChart() {
        const ctx = document.getElementById('payments-chart').getContext('2d');
        
        // Chart configuration
        paymentsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [], // Will be filled with dates
                datasets: [{
                    label: 'Payment Volume ($)',
                    data: [], // Will be filled with amounts
                    backgroundColor: colorPalette.background,
                    borderColor: colorPalette.primary,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: colorPalette.borderColor,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            color: colorPalette.textColor
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            color: colorPalette.textColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#fff',
                        titleColor: '#2D3748',
                        bodyColor: '#4A5568',
                        bodyFont: {
                            size: 13
                        },
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 12,
                        borderColor: colorPalette.borderColor,
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                return `$${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Chart options toggle (Volume vs Count)
    const chartOptions = document.querySelectorAll('.chart-option');
    chartOptions.forEach(option => {
        option.addEventListener('click', function() {
            chartOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            updateChartDisplayType(type);
        });
    });

    // Payment methods chart (pie chart)
    let methodsChart;
    function setupPaymentMethodsChart() {
        const ctx = document.getElementById('payment-methods-chart').getContext('2d');
        
        methodsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['USDT (Solana)', 'USDC (Base)', 'USDC (Solana)'],
                datasets: [{
                    data: [0, 0, 0], // Initialize with zeros, will be updated dynamically
                    backgroundColor: [
                        colorPalette.primary,    // Green for USDT (Solana)
                        colorPalette.secondary,  // Blue for USDC (Base)
                        colorPalette.tertiary    // Purple for USDC (Solana)
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#fff',
                        titleColor: '#2D3748',
                        bodyColor: '#4A5568',
                        bodyFont: {
                            size: 13
                        },
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 12,
                        borderColor: colorPalette.borderColor,
                        borderWidth: 1,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
        
        // Initialize with current period
        updatePaymentMethodsChart(currentPeriod);
    }

    // Add a function to update the payment methods chart
    function updatePaymentMethodsChart(period = currentPeriod, customRange = null) {
        if (!methodsChart) return;
        
        // Filter transactions based on the selected period
        let filteredTransactions = [];
        
        if (period === 'custom' && customRange) {
            const startDate = new Date(customRange.startDate);
            const endDate = new Date(customRange.endDate);
            filteredTransactions = allTransactions.filter(t => 
                t.status === 'completed' && t.date >= startDate && t.date <= endDate);
        } else {
            const today = new Date();
            
            switch(period) {
                case '7d':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= weekAgo);
                    break;
                case '30d':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= monthAgo);
                    break;
                case '90d':
                    const quarterAgo = new Date(today);
                    quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= quarterAgo);
                    break;
                case '1y':
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= yearAgo);
                    break;
                default:
                    const defaultWeekAgo = new Date(today);
                    defaultWeekAgo.setDate(defaultWeekAgo.getDate() - 7);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= defaultWeekAgo);
            }
        }
        
        // Count transactions by payment method
        let usdtSolanaCount = 0;
        let usdcBaseCount = 0;
        let usdcSolanaCount = 0;
        let totalVolume = 0;
        
        filteredTransactions.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            totalVolume += amount;

            
            if (transaction.token === 'usdt' && transaction.chain === 'solana') {
                usdtSolanaCount += amount;
            } else if (transaction.token === 'usdc' && transaction.chain === 'base') {
                usdcBaseCount += amount;
            } else if (transaction.token === 'usdc' && transaction.chain === 'solana') {
                usdcSolanaCount += amount;
            }
        });
        
        // Calculate percentages
        const usdtSolanaPercentage = totalVolume > 0 ? Math.round((usdtSolanaCount / totalVolume) * 100) : 0;
        const usdcBasePercentage = totalVolume > 0 ? Math.round((usdcBaseCount / totalVolume) * 100) : 0;
        const usdcSolanaPercentage = totalVolume > 0 ? Math.round((usdcSolanaCount / totalVolume) * 100) : 0;
        
        // Update chart data
        methodsChart.data.datasets[0].data = [
            usdtSolanaPercentage, 
            usdcBasePercentage, 
            usdcSolanaPercentage
        ];
        
        // Update chart
        methodsChart.update();
        
        // Update legend in HTML
        updatePaymentMethodsLegend(usdtSolanaPercentage, usdcBasePercentage, usdcSolanaPercentage);
    }

    // Function to update the legend HTML
    function updatePaymentMethodsLegend(usdtSolanaPercentage, usdcBasePercentage, usdcSolanaPercentage) {
        const legendContainer = document.querySelector('.payment-methods-chart .chart-legend');
        if (!legendContainer) return;
        
        legendContainer.innerHTML = `
            <div class="legend-item">
                <div class="color-dot" style="background-color: ${colorPalette.primary};"></div>
                <div class="legend-label">USDT (Solana): ${usdtSolanaPercentage}%</div>
            </div>
            <div class="legend-item">
                <div class="color-dot" style="background-color: ${colorPalette.secondary};"></div>
                <div class="legend-label">USDC (Base): ${usdcBasePercentage}%</div>
            </div>
            <div class="legend-item">
                <div class="color-dot" style="background-color: ${colorPalette.tertiary};"></div>
                <div class="legend-label">USDC (Solana): ${usdcSolanaPercentage}%</div>
            </div>
        `;
    }

    // Payment source chart (pie chart)
    let sourceChart;
    function setupPaymentSourceChart() {
        const ctx = document.getElementById('payment-source-chart').getContext('2d');
        
        sourceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Web Checkout', 'Payment Links'],
                datasets: [{
                    data: [0, 0], // Initialize with zeros, will be updated dynamically
                    backgroundColor: [
                        colorPalette.primary,
                        colorPalette.secondary
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#fff',
                        titleColor: '#2D3748',
                        bodyColor: '#4A5568',
                        bodyFont: {
                            size: 13
                        },
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 12,
                        borderColor: colorPalette.borderColor,
                        borderWidth: 1,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
        
        // Initialize with current period
        updatePaymentSourceChart(currentPeriod);
    }

    // Add a function to update the payment source chart
    function updatePaymentSourceChart(period = currentPeriod, customRange = null) {
        if (!sourceChart) return;
        
        // Filter transactions based on the selected period
        let filteredTransactions = [];
        
        if (period === 'custom' && customRange) {
            const startDate = new Date(customRange.startDate);
            const endDate = new Date(customRange.endDate);
            filteredTransactions = allTransactions.filter(t => 
                t.status === 'completed' && t.date >= startDate && t.date <= endDate);
        } else {
            const today = new Date();
            
            switch(period) {
                case '7d':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= weekAgo);
                    break;
                case '30d':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= monthAgo);
                    break;
                case '90d':
                    const quarterAgo = new Date(today);
                    quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= quarterAgo);
                    break;
                case '1y':
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= yearAgo);
                    break;
                default:
                    const defaultWeekAgo = new Date(today);
                    defaultWeekAgo.setDate(defaultWeekAgo.getDate() - 7);
                    filteredTransactions = allTransactions.filter(t => 
                        t.status === 'completed' && t.date >= defaultWeekAgo);
            }
        }
        
        // Count transactions by payment source
        let webCheckoutCount = 0;
        let paymentLinksCount = 0;
        
        filteredTransactions.forEach(transaction => {
            if (transaction.source === 'web-checkout') {
                webCheckoutCount++;
            } else if (transaction.source === 'payment-link') {
                paymentLinksCount++;
            }
        });
        
        const total = webCheckoutCount + paymentLinksCount;
        
        // Calculate percentages
        const webCheckoutPercentage = total > 0 ? Math.round((webCheckoutCount / total) * 100) : 0;
        const paymentLinksPercentage = total > 0 ? Math.round((paymentLinksCount / total) * 100) : 0;
        
        // Update chart data
        sourceChart.data.datasets[0].data = [webCheckoutPercentage, paymentLinksPercentage];
        
        // Update chart
        sourceChart.update();
        
        // Update legend in HTML
        updatePaymentSourceLegend(webCheckoutPercentage, paymentLinksPercentage);
    }

    // Function to update the source legend HTML
    function updatePaymentSourceLegend(webCheckoutPercentage, paymentLinksPercentage) {
        const legendContainer = document.querySelector('.payment-source-chart .chart-legend');
        if (!legendContainer) return;
        
        legendContainer.innerHTML = `
            <div class="legend-item">
                <div class="color-dot" style="background-color: ${colorPalette.primary};"></div>
                <div class="legend-label">Web Checkout: ${webCheckoutPercentage}%</div>
            </div>
            <div class="legend-item">
                <div class="color-dot" style="background-color: ${colorPalette.secondary};"></div>
                <div class="legend-label">Payment Links: ${paymentLinksPercentage}%</div>
            </div>
        `;
    }

    // Update chart display type (Volume vs Count)
    function updateChartDisplayType(type) {
        if (!paymentsChart) return;
        
        // Update chart dataset based on type
        if (type === 'volume') {
            paymentsChart.data.datasets[0].label = 'Payment Volume ($)';
            paymentsChart.data.datasets[0].data = volumeData.slice(-7); // Default to 7 days
            paymentsChart.options.plugins.tooltip.callbacks.label = function(context) {
                return `$${context.parsed.y.toFixed(2)}`;
            };
        } else { // count
            paymentsChart.data.datasets[0].label = 'Payment Count';
            paymentsChart.data.datasets[0].data = countData.slice(-7); // Default to 7 days
            paymentsChart.options.plugins.tooltip.callbacks.label = function(context) {
                return `${context.parsed.y} payments`;
            };
        }
        
        // Make sure we update with the current period selection
        const period = document.querySelector('.period-btn.active')?.getAttribute('data-period') || currentPeriod;
        updateChartDataForPeriod(period);
        
        paymentsChart.update();
    }

    // ====== Transactions Table Setup ======
    // Elements
    const transactionsTableBody = document.getElementById('transactions-table-body');
    const transactionsLoading = document.getElementById('transactions-loading');
    const transactionsEmpty = document.getElementById('transactions-empty');
    const prevPageBtn = document.getElementById('trans-prev-page');
    const nextPageBtn = document.getElementById('trans-next-page');
    const pageIndicator = document.getElementById('trans-page-indicator');
    
    // Transaction search and filter elements
    const transactionSearch = document.getElementById('transaction-search');
    const statusFilter = document.getElementById('transaction-status-filter');
    const sourceFilter = document.getElementById('transaction-source-filter');
    const dateFilter = document.getElementById('transaction-date-filter');
    
    // Add event listeners for filters
    if (transactionSearch) {
        transactionSearch.addEventListener('input', filterTransactions);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTransactions);
    }
    
    if (sourceFilter) {
        sourceFilter.addEventListener('change', filterTransactions);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', filterTransactions);
    }
    
    // Pagination variables
    let currentPage = 1;
    let totalPages = 1;
    const itemsPerPage = 10;
    
    // Sample data for transactions
    let allTransactions = [];
    let filteredTransactions = [];
    
    // Generate sample data for different time periods
    const volumeData = [];
    const countData = [];
    const dateLabels = [];
    


    //***********************/
    //**** Main Function ****/
    //***********************/

    async function initializeDashboard() {
        // Set up loading indicator
        document.body.classList.add('loading');
        
        try {
            const dataLoaded = await fetchAllTransactions();
            
            if (!dataLoaded) {
                // If data failed to load, show appropriate message
                document.body.classList.remove('loading');
                return;
            }
            
            // Setup charts
            setupPaymentVolumeChart();
            setupPaymentMethodsChart();
            setupPaymentSourceChart();
            
            // Update chart data with initial period
            updateDashboardData(currentPeriod);
            
            // Load transactions table
            loadTransactionData();
            
            // Update stats cards
            updateStatsCards();
            
            // Everything is ready, remove loading state
            document.body.classList.remove('loading');
            
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            document.body.classList.remove('loading');
            
            // Show error message
            const errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.innerHTML = '<h3>Error loading dashboard</h3><p>Something went wrong. Please try refreshing the page.</p>';
            document.querySelector('.dashboard-container').appendChild(errorEl);
        }
    }
        
    
    //FetchAllTransactions from backend
    async function fetchAllTransactions() {
        try {
            // Show loading states
            if (transactionsLoading) {
                transactionsLoading.style.display = 'flex';
            }
            
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const userId = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).id : null;
            if (!token) {
                console.error('No authentication token found');
                window.location.href = '../login/';
                return false;
            }
                    
            // Fetch all transaction data from your API
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
            
            // Reset existing data
            allTransactions = [];
            volumeData.length = 0;
            countData.length = 0;
            dateLabels.length = 0;
            
            // Process the transaction data
            if (data && data.transactions && Array.isArray(data.transactions)) {
                // Convert date strings to Date objects
                allTransactions = data.transactions.map(transaction => ({
                    ...transaction,
                    date: new Date(transaction.date)
                }));
                
                // Sort by date (newest first)
                allTransactions.sort((a, b) => b.date - a.date);
                
                // Store in a window variable for access across JS files
                window.sharedTransactionData = allTransactions;
                
                // Mark that data is loaded for other components
                window.transactionsDataLoaded = true;
                
                // Process the data for charts
                processTransactionsForCharts();
                
                // Dispatch event to notify other components
                window.dispatchEvent(new CustomEvent('transactionsLoaded'));
                
                return true;
            } else {
                throw new Error('Invalid data structure received from API');
            }
        } catch (error) {
            console.error('Error fetching transaction data:', error);
            
            // Show error in UI
            if (transactionsLoading) {
                transactionsLoading.style.display = 'none';
            }
            
            if (transactionsEmpty) {
                transactionsEmpty.classList.remove('hidden');
                const errorTitle = transactionsEmpty.querySelector('h3');
                const errorMsg = transactionsEmpty.querySelector('p');
                
                if (errorTitle) errorTitle.textContent = 'Error loading data';
                if (errorMsg) errorMsg.textContent = 'Could not connect to the server. Please try again later.';
            }
            
            return false;
        } finally {
            if (transactionsLoading) {
                transactionsLoading.style.display = 'none';
            }
        }
    }
    
    // Update dashboard based on selected time period
    function updateDashboardData(period = currentPeriod, customRange = null) {
        // In a real app, you would fetch new data based on the period
        // For demo, we'll just update the chart data
        
        // Update chart data based on period
        updateChartDataForPeriod(period, customRange);
        
        // Update the payment methods chart
        updatePaymentMethodsChart(period, customRange);
        
        // Update the payment source chart
        updatePaymentSourceChart(period, customRange);
        
        // Update transaction filters
        if (dateFilter) {
            // Map the period values to match the dateFilter values
            let dateFilterValue;
            switch (period) {
                case '7d': dateFilterValue = 'week'; break;
                case '30d': dateFilterValue = 'month'; break;
                case '90d': dateFilterValue = 'quarter'; break;
                case '1y': dateFilterValue = 'all'; break;
                case 'custom': dateFilterValue = 'all'; break; // Custom is handled separately
                default: dateFilterValue = 'week';
            }
            dateFilter.value = dateFilterValue;
            filterTransactions();
        }
        
        // Update stats cards
        updateStatsCards(period, customRange);
    }

    function updateChartDataForPeriod(period, customRange = null) {
        // In a real app, this would fetch data from API
        // For demo, we'll just use different slices of our sample data
        
        let labels = [], volumes = [], counts = [];
        
        if (period === 'custom' && customRange) {
            // Handle custom date range
            try {
                const startDate = new Date(customRange.startDate);
                const endDate = new Date(customRange.endDate);
                
                // Make sure we have valid dates
                if (!isNaN(startDate) && !isNaN(endDate)) {
                    // Go through all dates in our sample data and filter by the custom range
                    const today = new Date();
                    
                    // For each day in our dataset (30 days), check if it's within the range
                    for (let i = 365; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(today.getDate() - i);
                        
                        // If this date is within our selected range
                        if (date >= startDate && date <= endDate) {
                            // Get transactions for this day
                            const completedTransactionsForDay = allTransactions.filter(t => 
                                t.status === 'completed' && 
                                formatDate(t.date) === formatDate(date)
                            );
                            
                            // Calculate volume and count
                            const dayVolume = completedTransactionsForDay.reduce(
                                (sum, t) => sum + parseFloat(t.amount), 0
                            );
                            
                            labels.push(dateLabels[365-i]);
                            volumes.push(dayVolume);
                            counts.push(completedTransactionsForDay.length);
                        }
                    }
                    
                    // If no dates matched (which shouldn't happen, but just in case)
                    if (labels.length === 0) {
                        // Fallback to default 7 days
                        labels = dateLabels.slice(-7);
                        volumes = volumeData.slice(-7);
                        counts = countData.slice(-7);
                    }
                } else {
                    // Invalid date fallback
                    labels = dateLabels.slice(-7);
                    volumes = volumeData.slice(-7);
                    counts = countData.slice(-7);
                }
            } catch (e) {
                console.error("Error processing custom date range:", e);
                // Fallback to default
                labels = dateLabels.slice(-7);
                volumes = volumeData.slice(-7);
                counts = countData.slice(-7);
            }
        } else {
            // Your existing period handling code stays the same
            // The volumeData and countData arrays are already filtered to only include completed transactions
            switch(period) {
                case '7d':
                    labels = dateLabels.slice(-7);
                    volumes = volumeData.slice(-7);
                    counts = countData.slice(-7);
                    break;
                case '30d':
                    labels = dateLabels.slice(-30);
                    volumes = volumeData.slice(-30);
                    counts = countData.slice(-30);
                    break;
                case '90d':
                    labels = dateLabels.slice(-90);
                    volumes = volumeData.slice(-90);
                    counts = countData.slice(-90);
                    break;
                case '1y':
                    // Use weekly data points for 1Y view to improve performance
                    const weeklyLabels = [];
                    const weeklyVolumes = [];
                    const weeklyCounts = [];
                    
                    // Sample every 7th day (weekly data points)
                    for (let i = 0; i < dateLabels.length; i += 7) {
                        weeklyLabels.push(dateLabels[i]);
                        
                        // Calculate weekly totals
                        let weeklyVolume = 0;
                        let weeklyCount = 0;
                        
                        // Sum up to 7 days (or whatever's left)
                        for (let j = 0; j < 7 && i + j < volumeData.length; j++) {
                            weeklyVolume += volumeData[i + j];
                            weeklyCount += countData[i + j];
                        }
                        
                        weeklyVolumes.push(weeklyVolume);
                        weeklyCounts.push(weeklyCount);
                    }
                    
                    labels = weeklyLabels;
                    volumes = weeklyVolumes;
                    counts = weeklyCounts;
                    break;
                default:
                    labels = dateLabels.slice(-7);
                    volumes = volumeData.slice(-7);
                    counts = countData.slice(-7);
            }
        }
        
        // Update the chart data
        paymentsChart.data.labels = labels;
        
        // Determine which dataset to use based on current view
        const activeType = document.querySelector('.chart-option.active').getAttribute('data-type');
        if (activeType === 'volume') {
            paymentsChart.data.datasets[0].data = volumes;
        } else {
            paymentsChart.data.datasets[0].data = counts;
        }
        
        paymentsChart.update();
    }
    
    function updateStatsCards(period = currentPeriod, customRange = null) {
        // In a real app, this would update the stats cards with real data
        // For demo purposes, we'll calculate from our sample data
        
        let filteredData = [];
        
        // Filter transactions based on time period
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (period === 'custom' && customRange) {
            const startDate = new Date(customRange.startDate);
            const endDate = new Date(customRange.endDate);
            filteredData = allTransactions.filter(t => t.date >= startDate && t.date <= endDate);
        } else {
            switch(period) {
                case '7d':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filteredData = allTransactions.filter(t => t.date >= weekAgo);
                    break;
                case '30d':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    filteredData = allTransactions.filter(t => t.date >= monthAgo);
                    break;
                case '90d':
                    const quarterAgo = new Date(today);
                    quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                    filteredData = allTransactions.filter(t => t.date >= quarterAgo);
                    break;
                case '1y':
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    filteredData = allTransactions.filter(t => t.date >= yearAgo);
                    break;
                default:
                    const defaultWeekAgo = new Date(today);
                    defaultWeekAgo.setDate(defaultWeekAgo.getDate() - 7);
                    filteredData = allTransactions.filter(t => t.date >= defaultWeekAgo);
            }
        }

        // Calculate stats for current period
        const completedTransactions = filteredData.filter(t => t.status === 'completed');
        const totalVolume = completedTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const avgTransaction = completedTransactions.length ? totalVolume / completedTransactions.length : 0;
        const successRate = filteredData.length > 0 ? 
            (completedTransactions.length / filteredData.length * 100).toFixed(1) : 0;

        // Calculate stats for previous period (for percentage change)
        let prevPeriodData = [];
        
        // Determine the previous period based on the current period
        if (period === 'custom' && customRange) {
            const startDate = new Date(customRange.startDate);
            const endDate = new Date(customRange.endDate);
            const duration = endDate.getTime() - startDate.getTime();
            
            // Create a previous period of the same duration
            const prevEndDate = new Date(startDate);
            prevEndDate.setTime(prevEndDate.getTime() - 1); // 1ms before start date
            
            const prevStartDate = new Date(prevEndDate);
            prevStartDate.setTime(prevStartDate.getTime() - duration);
            
            prevPeriodData = allTransactions.filter(t => 
                t.date >= prevStartDate && t.date <= prevEndDate);
        } else {
            switch(period) {
                case '7d':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    
                    const twoWeeksAgo = new Date(today);
                    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                    
                    prevPeriodData = allTransactions.filter(t => 
                        t.date >= twoWeeksAgo && t.date < weekAgo);
                    break;
                case '30d':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    
                    const twoMonthsAgo = new Date(today);
                    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
                    
                    prevPeriodData = allTransactions.filter(t => 
                        t.date >= twoMonthsAgo && t.date < monthAgo);
                    break;
                case '90d':
                    const quarterAgo = new Date(today);
                    quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                    
                    const sixMonthsAgo = new Date(today);
                    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                    
                    prevPeriodData = allTransactions.filter(t => 
                        t.date >= sixMonthsAgo && t.date < quarterAgo);
                    break;
                case '1y':
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    
                    const twoYearsAgo = new Date(today);
                    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
                    
                    prevPeriodData = allTransactions.filter(t => 
                        t.date >= twoYearsAgo && t.date < yearAgo);
                    break;
                default:
                    const defaultWeekAgo = new Date(today);
                    defaultWeekAgo.setDate(defaultWeekAgo.getDate() - 7);
                    
                    const defaultTwoWeeksAgo = new Date(today);
                    defaultTwoWeeksAgo.setDate(defaultTwoWeeksAgo.getDate() - 14);
                    
                    prevPeriodData = allTransactions.filter(t => 
                        t.date >= defaultTwoWeeksAgo && t.date < defaultWeekAgo);
            }
        }
        
        // Calculate previous period stats
        const prevCompletedTransactions = prevPeriodData.filter(t => t.status === 'completed');
        const prevTotalVolume = prevCompletedTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const prevAvgTransaction = prevCompletedTransactions.length ? 
            prevTotalVolume / prevCompletedTransactions.length : 0;
        const prevSuccessRate = prevPeriodData.length > 0 ? 
            (prevCompletedTransactions.length / prevPeriodData.length * 100).toFixed(1) : 0;
        
        // Calculate percentage changes
        const volumeChange = prevTotalVolume > 0 ? 
            ((totalVolume - prevTotalVolume) / prevTotalVolume * 100).toFixed(1) : 0;
        const transactionChange = prevCompletedTransactions.length > 0 ? 
            ((completedTransactions.length - prevCompletedTransactions.length) / prevCompletedTransactions.length * 100).toFixed(1) : 0;
        const avgChange = prevAvgTransaction > 0 ? 
            ((avgTransaction - prevAvgTransaction) / prevAvgTransaction * 100).toFixed(1) : 0;
        const successRateChange = prevSuccessRate > 0 ? 
            ((successRate - prevSuccessRate) / prevSuccessRate * 100).toFixed(1) : 0;
        
        // Update the cards
        const totalVolumeEl = document.querySelectorAll('.stat-card')[0];
        const transactionCountEl = document.querySelectorAll('.stat-card')[1];
        const avgTransactionEl = document.querySelectorAll('.stat-card')[2];
        const successRateEl = document.querySelectorAll('.stat-card')[3];
        
        if (totalVolumeEl) {
            totalVolumeEl.querySelector('.stat-value').textContent = `$${totalVolume.toFixed(2)}`;
            updateTrendIndicator(totalVolumeEl, volumeChange);
        }
        
        if (transactionCountEl) {
            transactionCountEl.querySelector('.stat-value').textContent = completedTransactions.length;
            updateTrendIndicator(transactionCountEl, transactionChange);
        }
        
        if (avgTransactionEl) {
            avgTransactionEl.querySelector('.stat-value').textContent = `$${avgTransaction.toFixed(2)}`;
            updateTrendIndicator(avgTransactionEl, avgChange);
        }
        
        if (successRateEl) {
            successRateEl.querySelector('.stat-value').textContent = `${successRate}%`;
            updateTrendIndicator(successRateEl, successRateChange);
        }
    }

    //Process the backend transactions data for charts
    function processTransactionsForCharts() {
        // Generate date ranges for the last 365 days instead of just 30
        const today = new Date();
        const transactionsByDate = {};
        
        // Initialize the date buckets for 365 days
        for (let i = 364; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateString = formatDate(date);
            dateLabels.push(dateString);
            
            transactionsByDate[dateString] = {
                totalVolume: 0,
                transactionCount: 0
            };
        }
        
        // Process each transaction and add it to the appropriate date bucket
        allTransactions.forEach(transaction => {
            // Only include completed transactions in chart data
            if (transaction.status === 'completed') {
                const txDate = formatDate(transaction.date);
                
                // Make sure this date exists in our buckets
                if (transactionsByDate[txDate]) {
                    transactionsByDate[txDate].totalVolume += parseFloat(transaction.amount);
                    transactionsByDate[txDate].transactionCount += 1;
                }
            }
        });
        
        // Convert the bucketed data into arrays for our charts
        for (let i = 0; i < dateLabels.length; i++) {
            const dateData = transactionsByDate[dateLabels[i]];
            volumeData.push(dateData.totalVolume);
            countData.push(dateData.transactionCount);
        }
    }
        
    // Load and display transaction data
    function loadTransactionData() {
        // Show loading state
        transactionsLoading.style.display = 'flex';
        transactionsTableBody.innerHTML = '';
        transactionsEmpty.classList.add('hidden');
        
        // Apply filters to get updated transaction list
        filterTransactions();
    }
        
    // Filter transactions based on search and filters
    function filterTransactions() {
        const searchTerm = transactionSearch.value.toLowerCase();
        const statusValue = statusFilter.value;
        const sourceValue = sourceFilter.value;
        const dateValue = dateFilter.value;
        
        // Apply filters
        filteredTransactions = allTransactions.filter(transaction => {
            // Search filter
            const matchesSearch = 
                transaction.id.toLowerCase().includes(searchTerm) ||
                transaction.customer.toLowerCase().includes(searchTerm) ||
                transaction.amount.toString().includes(searchTerm);
            
            // Status filter
            const matchesStatus = statusValue === 'all' || transaction.status === statusValue;
            
            // Source filter
            const matchesSource = sourceValue === 'all' || transaction.source === sourceValue;
            
            // Date filter
            let matchesDate = true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateValue !== 'all') {
                if (dateValue === 'today') {
                    const transactionDate = new Date(transaction.date);
                    transactionDate.setHours(0, 0, 0, 0);
                    matchesDate = transactionDate.getTime() === today.getTime();
                } else if (dateValue === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    matchesDate = transaction.date >= weekAgo;
                } else if (dateValue === 'month') {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    matchesDate = transaction.date >= monthAgo;
                } else if (dateValue === 'quarter') {
                    const quarterAgo = new Date(today);
                    quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                    matchesDate = transaction.date >= quarterAgo;
                }
            }
            
            return matchesSearch && matchesStatus && matchesSource && matchesDate;
        });

        // Update pagination
        totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        currentPage = 1; // Reset to first page when filtering
        
        // Display transactions for current page
        displayTransactions();
    }
        
    // Display current page of transactions
    function displayTransactions() {
        // Hide loading indicator
        if (transactionsLoading) {
            transactionsLoading.style.display = 'none';
        }
        
        // Clear table body first
        if (transactionsTableBody) {
            transactionsTableBody.innerHTML = '';
        }
        
        // Check if we have any transactions after filtering
        if (!filteredTransactions || filteredTransactions.length === 0) {
            if (transactionsEmpty) {
                // Show appropriate empty message based on filter
                const statusValue = statusFilter ? statusFilter.value : 'all';
                if (statusValue !== 'all') {
                    transactionsEmpty.querySelector('h3').textContent = 'No Matching Transactions';
                    transactionsEmpty.querySelector('p').textContent = 
                        `No ${capitalizeFirstLetter(statusValue)} transactions found with the current filters.`;
                } else {
                    transactionsEmpty.querySelector('h3').textContent = 'No Transactions Found';
                    transactionsEmpty.querySelector('p').textContent = 
                        'No transactions match your current filters.';
                }
                
                transactionsEmpty.classList.remove('hidden');
            }
            updatePagination();
            return;
        }
        
        // Hide empty state
        if (transactionsEmpty) {
            transactionsEmpty.classList.add('hidden');
        }
        
        // Calculate start and end index for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
        
        // Get current page of transactions
        const currentTransactions = filteredTransactions.slice(startIndex, endIndex);
        
        // Add rows for current transactions
        currentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = 'transaction-row';
            row.setAttribute('data-id', transaction.id);
            
            const formattedDate = formatDateTime(transaction.date);
            const sourceDisplay = transaction.source === 'web-checkout' ? 'Web Checkout' : 'Payment Link';
            
            row.innerHTML = `
                <td><a href="#" class="transaction-link">${transaction.id}</a></td>
                <td>${formattedDate}</td>
                <td>$${parseFloat(transaction.amount).toFixed(2)}</td>
                <td>${transaction.customer}</td>
                <td>${sourceDisplay}</td>
                <td><span class="status-badge status-${transaction.status}">${capitalizeFirstLetter(transaction.status)}</span></td>
            `;
            
            transactionsTableBody.appendChild(row);
        });
        
        // Add click event listeners to transaction rows
        const transactionLinks = document.querySelectorAll('.transaction-link');
        transactionLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const transactionId = this.closest('tr').getAttribute('data-id');
                openTransactionDetails(transactionId);
            });
        });
        
        // Update pagination
        updatePagination();
    }

    // Update pagination controls
    function updatePagination() {
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // Next page click handler
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayTransactions();
        }
    });
    
    // Previous page click handler
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayTransactions();
        }
    });
    
    // Function to open transaction details modal
    function openTransactionDetails(transactionId) {
        const transaction = allTransactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        // Get modal elements
        const modal = document.getElementById('transaction-details-modal');
        const modalContent = document.getElementById('transaction-details-content');
        
        // Format data for display
        const formattedDate = formatDateTime(transaction.date);
        const sourceDisplay = transaction.source === 'web-checkout' ? 'Web Checkout' : 'Payment Link';
        
        // Build modal content
        modalContent.innerHTML = `
            <div class="transaction-detail-header">
                <h4>Payment ID: ${transaction.id}</h4>
                <div class="status-badge status-${transaction.status}">${capitalizeFirstLetter(transaction.status)}</div>
            </div>
            
            <div class="transaction-detail-body">
                <div class="detail-group">
                    <div class="detail-label">Amount:</div>
                    <div class="detail-value">$${parseFloat(transaction.amount).toFixed(2)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Date & Time:</div>
                    <div class="detail-value">${formattedDate}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Customer ID:</div>
                    <div class="detail-value">${transaction.customer}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Source:</div>
                    <div class="detail-value">${sourceDisplay}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Chain:</div>
                    <div class="detail-value">${transaction.chain || 'N/A'}</div>
                </div>
                ${transaction.wallet ? `
                <div class="detail-group">
                    <div class="detail-label">Wallet Address:</div>
                    <div class="detail-value">
                        ${truncateMiddle(transaction.wallet, 8)}
                        <button class="copy-btn-wallet" data-copy="${transaction.wallet}">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Show the modal
        modal.classList.remove('hidden');
        
        // Add copy functionality to buttons
        const copyButtons = modal.querySelectorAll('.copy-btn-wallet');
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                copyToClipboard(textToCopy, this);
            });
        });
        
        // Add close button event
        const closeButton = modal.querySelector('.modal-close-btn');
        closeButton.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    // Helper function to copy text to clipboard
    function copyToClipboard(text, button) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            
            // Visual feedback
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.color = 'var(--primary-color)';
            
            // Reset after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.style.color = '';
            }, 1500);
            
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        document.body.removeChild(textarea);
    }

    // Add a refresh data function for manual refreshing
    async function refreshDashboardData() {
        try {
            document.body.classList.add('refreshing');
            
            // Clear current data
            allTransactions = [];
            filteredTransactions = [];
            
            // Fetch new data
            const success = await fetchAllTransactions();
            
            if (success) {
                // Update everything
                updateDashboardData(currentPeriod);
                loadTransactionData();
                updateStatsCards();
                
                // Show success message
                showToast('Dashboard data refreshed successfully');
            } else {
                // Show error message
                showToast('Failed to refresh data', 'error');
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            showToast('Failed to refresh data', 'error');
        } finally {
            document.body.classList.remove('refreshing');
        }
    }

    // Add this toast notification function if you don't have it yet
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide and remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    

    //***************************/
    //**** Helper functions ****//
    //***************************/

    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    function formatDateTime(date) {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function truncateMiddle(str, visibleChars) {
        if (!str) return '';
        if (str.length <= visibleChars * 2) return str;
        return `${str.substr(0, visibleChars)}...${str.substr(str.length - visibleChars, visibleChars)}`;
    }

    function updateTrendIndicator(cardElement, changePercentage) {
        const trendEl = cardElement.querySelector('.stat-trend');
        if (!trendEl) return;
        
        // Remove all existing classes
        trendEl.classList.remove('positive', 'negative', 'neutral');
        
        // Parse the change percentage
        const change = parseFloat(changePercentage);
        
        // Set the appropriate class, icon, and title
        if (change > 0) {
            trendEl.classList.add('positive');
            trendEl.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(change)}%`;
            trendEl.setAttribute('title', 'Increase compared to previous period');
        } else if (change < 0) {
            trendEl.classList.add('negative');
            trendEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(change)}%`;
            trendEl.setAttribute('title', 'Decrease compared to previous period');
        } else {
            trendEl.classList.add('neutral');
            trendEl.innerHTML = `<i class="fas fa-minus"></i> 0%`;
            trendEl.setAttribute('title', 'No change from previous period');
        }
    }
    
    // Initialize the dashboard
    initializeDashboard();

    // Add this to your event listeners
    const refreshBtn = document.getElementById('refresh-data-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboardData);
    }
});