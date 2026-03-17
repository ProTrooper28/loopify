const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const { getRazorpayInstance, verifyPaymentSignature } = require('../utils/razorpay');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.borrower.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'approved') {
            return res.status(400).json({ message: 'Booking must be approved before payment' });
        }

        const razorpay = getRazorpayInstance();

        const order = await razorpay.orders.create({
            amount: Math.round(booking.totalAmount * 100), // Convert to paise
            currency: 'INR',
            receipt: `booking_${booking._id}`,
            notes: {
                bookingId: booking._id.toString(),
                borrowerId: req.user._id.toString()
            }
        });

        booking.razorpayOrderId = order.id;
        await booking.save();

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            bookingId: booking._id,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Error creating payment order' });
    }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

        // Verify signature
        const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Create transactions
        await Transaction.create([
            {
                booking: booking._id,
                payer: booking.borrower,
                receiver: booking.owner,
                amount: booking.rentalCost,
                type: 'rental',
                razorpayPaymentId,
                razorpayOrderId,
                razorpaySignature,
                status: 'completed',
                description: 'Rental payment'
            },
            {
                booking: booking._id,
                payer: booking.borrower,
                receiver: booking.owner,
                amount: booking.depositAmount,
                type: 'deposit',
                razorpayPaymentId,
                razorpayOrderId,
                status: 'completed',
                description: 'Security deposit'
            }
        ]);

        // Update booking
        booking.paymentId = razorpayPaymentId;
        booking.status = 'active';
        await booking.save();

        res.json({ message: 'Payment verified successfully', booking });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

// @desc    Refund deposit
// @route   POST /api/payments/refund/:bookingId
exports.refundDeposit = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Booking must be completed for refund' });
        }

        const razorpay = getRazorpayInstance();

        let refundResult;
        if (booking.paymentId) {
            refundResult = await razorpay.payments.refund(booking.paymentId, {
                amount: Math.round(booking.depositAmount * 100)
            });
        } else {
            refundResult = { id: 'rfnd_mock_' + Date.now(), status: 'processed' };
        }

        // Create refund transaction
        await Transaction.create({
            booking: booking._id,
            payer: booking.owner,
            receiver: booking.borrower,
            amount: booking.depositAmount,
            type: 'refund',
            razorpayPaymentId: refundResult.id,
            status: 'completed',
            description: 'Security deposit refund'
        });

        res.json({ message: 'Deposit refunded successfully', refund: refundResult });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ message: 'Error processing refund' });
    }
};

// @desc    Get user's transactions
// @route   GET /api/payments/transactions
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ payer: req.user._id }, { receiver: req.user._id }]
        })
            .populate('booking', 'item startDate endDate')
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};
