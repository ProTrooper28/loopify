const Review = require('../models/Review');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Submit a review
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment, type } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // Determine reviewer and reviewee
        let reviewee;
        if (type === 'borrower-to-owner') {
            if (booking.borrower.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            reviewee = booking.owner;
        } else if (type === 'owner-to-borrower') {
            if (booking.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            reviewee = booking.borrower;
        } else {
            return res.status(400).json({ message: 'Invalid review type' });
        }

        // Check for existing review
        const existingReview = await Review.findOne({
            booking: bookingId,
            reviewer: req.user._id,
            type
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        const review = await Review.create({
            booking: bookingId,
            reviewer: req.user._id,
            reviewee,
            rating: Number(rating),
            comment,
            type
        });

        // Update reviewee's reputation score
        const revieweeUser = await User.findById(reviewee);
        await revieweeUser.updateReputation(Number(rating));

        await review.populate('reviewer', 'name profilePhoto');

        res.status(201).json(review);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Error creating review' });
    }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:id
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.id })
            .populate('reviewer', 'name profilePhoto')
            .populate('booking', 'item startDate endDate')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};
