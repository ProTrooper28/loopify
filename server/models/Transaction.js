const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['rental', 'deposit', 'refund'],
        required: true
    },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    razorpaySignature: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'refunded', 'failed'],
        default: 'pending'
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

transactionSchema.index({ payer: 1, createdAt: -1 });
transactionSchema.index({ booking: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
