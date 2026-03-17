const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500,
        default: ''
    },
    type: {
        type: String,
        enum: ['borrower-to-owner', 'owner-to-borrower'],
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ booking: 1, reviewer: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
