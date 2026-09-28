// Admin Charts JavaScript
// Handles all chart visualizations for admin dashboard

let revenueChart, statusChart, serviceChart, monthlyChart, mechanicChart;

// Initialize all charts
function initAllCharts() {
    initRevenueChart();
    initStatusChart();
    initServiceChart();
    initMonthlyTrendChart();
    initMechanicPerformanceChart();
}

// Revenue Chart (Line)
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Current Year Revenue',
                    data: [65000, 75000, 82000, 91000, 105000, 125000, 145000, 138000, 156000, 172000, 189000, 210000],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Previous Year Revenue',
                    data: [45000, 52000, 58000, 67000, 78000, 85000, 92000, 98000, 105000, 112000, 125000, 138000],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#28a745',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + context.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Status Distribution Chart (Doughnut)
function initStatusChart() {
    const ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx) return;
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'],
            datasets: [{
                data: [45, 32, 28, 156, 12],
                backgroundColor: ['#ffc107', '#17a2b8', '#fd7e14', '#28a745', '#dc3545'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Service Popularity Chart (Bar)
function initServiceChart() {
    const ctx = document.getElementById('serviceChart')?.getContext('2d');
    if (!ctx) return;
    
    serviceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Engine Repair', 'Oil Change', 'AC Service', 'Brake Service', 'Battery', 'Towing', 'Tyre', 'Full Service'],
            datasets: [{
                label: 'Number of Bookings',
                data: [145, 320, 98, 76, 112, 45, 89, 67],
                backgroundColor: '#764ba2',
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Bookings: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Bookings' }
                },
                x: {
                    ticks: { rotate: 45, maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });
}

// Monthly Trend Chart
function initMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyChart')?.getContext('2d');
    if (!ctx) return;
    
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Bookings',
                    data: [45, 62, 78, 53],
                    backgroundColor: '#667eea',
                    borderRadius: 8
                },
                {
                    label: 'Revenue (₹)',
                    data: [22500, 31000, 39000, 26500],
                    backgroundColor: '#28a745',
                    borderRadius: 8,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Revenue (₹)') {
                                return 'Revenue: ₹' + context.raw.toLocaleString();
                            }
                            return 'Bookings: ' + context.raw;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Bookings' }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    title: { display: true, text: 'Revenue (₹)' },
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Mechanic Performance Chart
function initMechanicPerformanceChart() {
    const ctx = document.getElementById('mechanicChart')?.getContext('2d');
    if (!ctx) return;
    
    mechanicChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Rajesh', 'Suresh', 'Amit', 'Vikram', 'Prakash', 'Anil'],
            datasets: [
                {
                    label: 'Jobs Completed',
                    data: [45, 38, 52, 29, 41, 35],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: '#667eea',
                    pointBackgroundColor: '#667eea'
                },
                {
                    label: 'Rating (out of 5)',
                    data: [4.8, 4.5, 4.9, 4.2, 4.6, 4.4],
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderColor: '#28a745',
                    pointBackgroundColor: '#28a745'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Update charts with new data
function updateCharts(data) {
    if (revenueChart && data.revenue) {
        revenueChart.data.datasets[0].data = data.revenue.currentYear;
        revenueChart.data.datasets[1].data = data.revenue.previousYear;
        revenueChart.update();
    }
    
    if (statusChart && data.statusDistribution) {
        statusChart.data.datasets[0].data = data.statusDistribution;
        statusChart.update();
    }
    
    if (serviceChart && data.servicePopularity) {
        serviceChart.data.datasets[0].data = data.servicePopularity;
        serviceChart.update();
    }
}

// Fetch chart data from API
async function fetchChartData() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/admin/charts-data', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            updateCharts(data);
        }
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}

// Export as PDF
function exportChartAsPDF() {
    const canvas = document.getElementById('revenueChart');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'revenue-chart.png';
        link.href = canvas.toDataURL();
        link.click();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initAllCharts();
    
    // Auto-refresh charts every minute
    setInterval(() => {
        fetchChartData();
    }, 60000);
});

// Export functions
window.initAllCharts = initAllCharts;
window.updateCharts = updateCharts;
window.exportChartAsPDF = exportChartAsPDF;