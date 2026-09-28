// User Payment JavaScript
// Handles payments, QR codes, and invoice generation

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Check authentication
if (!token) {
    window.location.href = '/login';
}

// DOM Elements
let paymentBookingSelect, paymentMethodSelect, paymentAmountInput, payNowBtn;
let qrCodeContainer, qrCodeImg, paymentSuccessBtn;
let paymentHistoryTable;

// Initialize payment page
document.addEventListener('DOMContentLoaded', () => {
    paymentBookingSelect = document.getElementById('paymentBooking');
    paymentMethodSelect = document.getElementById('paymentMethod');
    paymentAmountInput = document.getElementById('paymentAmount');
    payNowBtn = document.getElementById('payNowBtn');
    qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeImg = document.getElementById('qrCodeImg');
    paymentSuccessBtn = document.getElementById('paymentSuccessBtn');
    paymentHistoryTable = document.getElementById('paymentHistory');
    
    loadPendingPayments();
    loadPaymentHistory();
    
    if (paymentBookingSelect) {
        paymentBookingSelect.addEventListener('change', updateAmount);
    }
    
    if (payNowBtn) {
        payNowBtn.addEventListener('click', initiatePayment);
    }
    
    if (paymentSuccessBtn) {
        paymentSuccessBtn.addEventListener('click', confirmPayment);
    }
});

// API fetch helper
async function fetchAPI(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    if (data) options.body = JSON.stringify(data);
    
    try {
        const response = await fetch(endpoint, options);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message };
    }
}

// Load pending payments
async function loadPendingPayments() {
    if (!paymentBookingSelect) return;
    
    try {
        const response = await fetchAPI('/api/user/bookings');
        
        if (response.success && response.bookings) {
            const pendingPayments = response.bookings.filter(b => 
                b.paymentStatus === 'pending' && 
                b.status !== 'cancelled' &&
                b.status !== 'rejected'
            );
            
            if (pendingPayments.length === 0) {
                paymentBookingSelect.innerHTML = '<option value="">No pending payments</option>';
            } else {
                paymentBookingSelect.innerHTML = '<option value="">Select a booking to pay</option>' + 
                    pendingPayments.map(b => `<option value="${b._id}" data-amount="${b.estimatedCost || b.finalCost}">
                        ${b._id.slice(-8)} - ${b.serviceType} - ₹${b.estimatedCost || b.finalCost}
                    </option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// Update amount when booking selected
function updateAmount() {
    if (!paymentBookingSelect || !paymentAmountInput) return;
    
    const selectedOption = paymentBookingSelect.options[paymentBookingSelect.selectedIndex];
    const amount = selectedOption.getAttribute('data-amount');
    
    if (amount) {
        paymentAmountInput.value = '₹' + amount;
    } else {
        paymentAmountInput.value = '';
    }
}

// Initiate payment
async function initiatePayment() {
    const bookingId = paymentBookingSelect?.value;
    const method = paymentMethodSelect?.value;
    
    if (!bookingId) {
        Swal.fire('Error', 'Please select a booking to pay', 'error');
        return;
    }
    
    const amount = paymentAmountInput?.value.replace('₹', '');
    
    if (method === 'QR') {
        // Generate QR code
        Swal.fire({
            title: 'Generating QR Code',
            text: 'Please wait...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        const response = await fetchAPI('/api/payments/generate-qr', 'POST', {
            amount: parseFloat(amount),
            bookingId
        });
        
        if (response.success && response.qrCode) {
            Swal.close();
            if (qrCodeContainer && qrCodeImg) {
                qrCodeContainer.style.display = 'block';
                qrCodeImg.src = response.qrCode;
                
                // Store booking ID for confirmation
                localStorage.setItem('currentPaymentBooking', bookingId);
                localStorage.setItem('currentPaymentAmount', amount);
            }
        } else {
            Swal.fire('Error', 'Failed to generate QR code', 'error');
        }
    } else if (method === 'COD') {
        // Cash on Delivery
        const result = await Swal.fire({
            title: 'Confirm COD',
            text: `You have selected Cash on Delivery. Amount: ₹${amount}`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Confirm'
        });
        
        if (result.isConfirmed) {
            const paymentResponse = await fetchAPI('/api/payments/process', 'POST', {
                bookingId,
                amount: parseFloat(amount),
                method: 'COD',
                transactionId: 'COD-' + Date.now()
            });
            
            if (paymentResponse.success) {
                Swal.fire('Success!', 'Payment will be collected at delivery', 'success').then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire('Error', paymentResponse.message, 'error');
            }
        }
    }
}

// Confirm QR payment
async function confirmPayment() {
    const bookingId = localStorage.getItem('currentPaymentBooking');
    const amount = localStorage.getItem('currentPaymentAmount');
    
    if (!bookingId) {
        Swal.fire('Error', 'No payment in progress', 'error');
        return;
    }
    
    Swal.fire({
        title: 'Confirm Payment',
        text: 'Have you completed the payment?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Payment Done',
        cancelButtonText: 'Not Yet'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const paymentResponse = await fetchAPI('/api/payments/process', 'POST', {
                bookingId,
                amount: parseFloat(amount),
                method: 'QR',
                transactionId: 'QR-' + Date.now()
            });
            
            if (paymentResponse.success) {
                // Generate invoice
                const invoiceResponse = await fetchAPI('/api/payments/generate-invoice', 'POST', {
                    bookingId
                });
                
                if (invoiceResponse.success && invoiceResponse.invoice) {
                    // Download invoice
                    const link = document.createElement('a');
                    link.download = `invoice_${bookingId}.pdf`;
                    link.href = 'data:application/pdf;base64,' + invoiceResponse.invoice;
                    link.click();
                }
                
                Swal.fire('Payment Successful!', 'Your payment has been processed. Invoice downloaded.', 'success').then(() => {
                    localStorage.removeItem('currentPaymentBooking');
                    localStorage.removeItem('currentPaymentAmount');
                    window.location.reload();
                });
            } else {
                Swal.fire('Error', paymentResponse.message, 'error');
            }
        }
    });
}

// Load payment history
async function loadPaymentHistory() {
    if (!paymentHistoryTable) return;
    
    try {
        const response = await fetchAPI('/api/payments/history');
        
        if (response.success && response.payments && response.payments.length > 0) {
            displayPaymentHistory(response.payments);
        } else {
            // Demo data
            const demoPayments = [
                { _id: 'PAY001', createdAt: new Date(), bookingId: { _id: 'BK001', serviceType: 'Oil Change' }, amount: 499, method: 'QR', status: 'success' },
                { _id: 'PAY002', createdAt: new Date(), bookingId: { _id: 'BK002', serviceType: 'Engine Repair' }, amount: 2499, method: 'COD', status: 'pending' }
            ];
            displayPaymentHistory(demoPayments);
        }
    } catch (error) {
        console.error('Error loading payment history:', error);
    }
}

// Display payment history
function displayPaymentHistory(payments) {
    if (!paymentHistoryTable) return;
    
    if (payments.length === 0) {
        paymentHistoryTable.innerHTML = '<tr><td colspan="6" class="text-center">No payment history</td></tr>';
        return;
    }
    
    paymentHistoryTable.innerHTML = payments.map(p => `
        <tr>
            <td>${new Date(p.createdAt).toLocaleDateString()}</td>
            <td><code>${p.bookingId?._id?.slice(-8) || p.bookingId?.slice(-8) || 'N/A'}</code></td>
            <td>${p.bookingId?.serviceType || 'N/A'}</td>
            <td>₹${p.amount}</td>
            <td>${p.method}</td>
            <td><span class="badge ${p.status === 'success' ? 'bg-success' : 'bg-warning'}">${p.status}</span></td>
            <td>
                ${p.status === 'success' ? 
                    `<button class="btn btn-sm btn-info" onclick="downloadInvoice('${p.bookingId?._id || p.bookingId}')">
                        <i class="fas fa-download"></i> Invoice
                    </button>` : '-'}
            </td>
        </tr>
    `).join('');
}

// Download invoice
window.downloadInvoice = async function(bookingId) {
    Swal.fire({
        title: 'Generating Invoice',
        text: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
    
    const response = await fetchAPI('/api/payments/generate-invoice', 'POST', { bookingId });
    
    Swal.close();
    
    if (response.success && response.invoice) {
        const link = document.createElement('a');
        link.download = `invoice_${bookingId}.pdf`;
        link.href = 'data:application/pdf;base64,' + response.invoice;
        link.click();
        Swal.fire('Success', 'Invoice downloaded', 'success');
    } else {
        Swal.fire('Error', 'Failed to generate invoice', 'error');
    }
};

// Get payment summary
async function getPaymentSummary() {
    const response = await fetchAPI('/api/payments/history');
    if (response.success && response.payments) {
        const totalPaid = response.payments
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + p.amount, 0);
        const totalPending = response.payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);
        
        return { totalPaid, totalPending, count: response.payments.length };
    }
    return { totalPaid: 0, totalPending: 0, count: 0 };
}

// Export functions
window.loadPendingPayments = loadPendingPayments;
window.loadPaymentHistory = loadPaymentHistory;
window.downloadInvoice = downloadInvoice;