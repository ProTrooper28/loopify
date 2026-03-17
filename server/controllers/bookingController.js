const Booking = require('../models/Booking');
const Item = require('../models/Item');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc    Create booking request
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
    try {
        const { itemId, startDate, endDate, duration, durationType } = req.body;

        const item = await Item.findById(itemId);
        if (!item || item.status !== 'active') {
            return res.status(404).json({ message: 'Item not available' });
        }

        if (item.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot book your own item' });
        }

        // Calculate cost
        const price = durationType === 'hourly' ? item.hourlyPrice : item.dailyPrice;
        const rentalCost = price * Number(duration);
        const depositAmount = item.securityDeposit;
        const totalAmount = rentalCost + depositAmount;

        const booking = await Booking.create({
            item: itemId,
            borrower: req.user._id,
            owner: item.owner,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            duration: Number(duration),
            durationType,
            rentalCost,
            depositAmount,
            totalAmount,
            isInstantAccess: item.instantAccess,
            expiresAt: item.instantAccess ? new Date(Date.now() + 15 * 60 * 1000) : undefined // 15min expiry for instant
        });

        await booking.populate([
            { path: 'item', select: 'name photos hourlyPrice dailyPrice' },
            { path: 'borrower', select: 'name profilePhoto' },
            { path: 'owner', select: 'name profilePhoto' }
        ]);

        res.status(201).json(booking);
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Error creating booking' });
    }
};

// @desc    Get borrower's bookings
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ borrower: req.user._id })
            .populate('item', 'name photos hourlyPrice dailyPrice category')
            .populate('owner', 'name profilePhoto')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};

// @desc    Get owner's pending requests
// @route   GET /api/bookings/requests
exports.getBookingRequests = async (req, res) => {
    try {
        const bookings = await Booking.find({ owner: req.user._id })
            .populate('item', 'name photos')
            .populate('borrower', 'name profilePhoto reputationScore')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
};

// @desc    Approve booking
// @route   PATCH /api/bookings/:id/approve
exports.approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'requested') {
            return res.status(400).json({ message: 'Booking cannot be approved in current state' });
        }

        booking.status = 'approved';
        await booking.save();

        await booking.populate([
            { path: 'item', select: 'name photos' },
            { path: 'borrower', select: 'name profilePhoto email' }
        ]);

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error approving booking' });
    }
};

// @desc    Reject booking
// @route   PATCH /api/bookings/:id/reject
exports.rejectBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.status = 'rejected';
        await booking.save();

        res.json({ message: 'Booking rejected', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting booking' });
    }
};

// @desc    Upload pickup photo
// @route   PATCH /api/bookings/:id/pickup
exports.uploadPickupPhoto = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.borrower.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No photo uploaded' });
        }

        const photoUrl = await uploadToCloudinary(req.file.path);

        booking.pickupPhoto = photoUrl;
        booking.pickupTime = new Date();
        booking.status = 'active';
        await booking.save();

        res.json({ message: 'Pickup confirmed', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading pickup photo' });
    }
};

// @desc    Upload return photo
// @route   PATCH /api/bookings/:id/return
exports.uploadReturnPhoto = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.borrower.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No photo uploaded' });
        }

        const photoUrl = await uploadToCloudinary(req.file.path);

        booking.returnPhoto = photoUrl;
        booking.returnTime = new Date();
        booking.status = 'returned';
        await booking.save();

        res.json({ message: 'Return submitted', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading return photo' });
    }
};

// @desc    Complete booking (owner confirms return, triggers refund)
// @route   PATCH /api/bookings/:id/complete
exports.completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'returned') {
            return res.status(400).json({ message: 'Item must be returned first' });
        }

        booking.status = 'completed';
        await booking.save();

        // Update item booking count
        await Item.findByIdAndUpdate(booking.item, {
            $inc: { totalBookings: 1 }
        });

        res.json({ message: 'Booking completed. Deposit refund initiated.', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error completing booking' });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('item', 'name photos hourlyPrice dailyPrice category pickupLocation condition')
            .populate('borrower', 'name profilePhoto email phone reputationScore')
            .populate('owner', 'name profilePhoto email phone reputationScore');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only involved parties can view
        if (booking.borrower._id.toString() !== req.user._id.toString() &&
            booking.owner._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking' });
    }
};
