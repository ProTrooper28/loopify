const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        maxlength: 100
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['tripods', 'cameras', 'microphones', 'lighting', 'lab-equipment', 'tools', 'sports', 'musical-instruments', 'other'],
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 1000
    },
    photos: [{
        type: String
    }],
    hourlyPrice: {
        type: Number,
        required: [true, 'Hourly price is required'],
        min: 0
    },
    dailyPrice: {
        type: Number,
        required: [true, 'Daily price is required'],
        min: 0
    },
    securityDeposit: {
        type: Number,
        required: [true, 'Security deposit is required'],
        min: 0
    },
    availability: [{
        date: { type: Date },
        available: { type: Boolean, default: true }
    }],
    pickupLocation: {
        type: String,
        required: [true, 'Pickup location is required'],
        trim: true
    },
    condition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair', 'worn'],
        required: [true, 'Condition is required']
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'deleted'],
        default: 'active'
    },
    instantAccess: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    totalBookings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search
itemSchema.index({ name: 'text', description: 'text', category: 'text' });
itemSchema.index({ status: 1, category: 1, hourlyPrice: 1 });

module.exports = mongoose.model('Item', itemSchema);
