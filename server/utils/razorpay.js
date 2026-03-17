// Prototypical payment configuration
// Replaces Razorpay entirely with dummy functions for local testing

const getRazorpayInstance = () => ({
    orders: {
        create: async (options) => ({
            id: 'order_mock_' + Date.now(),
            amount: options.amount,
            currency: options.currency || 'INR',
            receipt: options.receipt,
            status: 'created'
        })
    },
    payments: {
        fetch: async (paymentId) => ({
            id: paymentId,
            status: 'captured',
            amount: 10000 // Dummy static amount for fetching
        }),
        refund: async (paymentId, options) => ({
            id: 'rfnd_mock_' + Date.now(),
            payment_id: paymentId,
            amount: options.amount,
            status: 'processed'
        })
    }
});

// Verify Dummy payment signature (always returns true for testing)
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    console.log(`✅ [Prototypical] Auto-verifying payment signature for Order: ${orderId}`);
    return true;
};

module.exports = { getRazorpayInstance, verifyPaymentSignature };
