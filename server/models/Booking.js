const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    duration: {
        type: Number,
        required: true
    },
    durationType: {
        type: String,
        enum: ['hourly', 'daily'],
        required: true
    },
    rentalCost: {
        type: Number,
        required: true
    },
    depositAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['requested', 'approved', 'rejected', 'active', 'returned', 'completed', 'disputed', 'cancelled'],
        default: 'requested'
    },
    pickupPhoto: {
        type: String,
        default: ''
    },
    returnPhoto: {
        type: String,
        default: ''
    },
    pickupTime: Date,
    returnTime: Date,
    paymentId: String,
    razorpayOrderId: String,
    isInstantAccess: {
        type: Boolean,
        default: false
    },
    expiresAt: Date  // For instant access bookings
}, {
    timestamps: true
});

bookingSchema.index({ borrower: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ item: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
