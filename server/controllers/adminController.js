const User = require('../models/User');
const Item = require('../models/Item');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-emailVerificationToken -emailVerificationExpires')
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit)),
            User.countDocuments(query)
        ]);

        res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// @desc    Get all listings
// @route   GET /api/admin/listings
exports.getAllListings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const [items, total] = await Promise.all([
            Item.find()
                .populate('owner', 'name email')
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit)),
            Item.countDocuments()
        ]);

        res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching listings' });
    }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const [transactions, total] = await Promise.all([
            Transaction.find()
                .populate('payer', 'name email')
                .populate('receiver', 'name email')
                .populate('booking')
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit)),
            Transaction.countDocuments()
        ]);

        res.json({ transactions, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// @desc    Ban/Unban user
// @route   PATCH /api/admin/users/:id/ban
exports.toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

// @desc    Remove listing
// @route   DELETE /api/admin/listings/:id
exports.removeListing = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(
            req.params.id,
            { status: 'deleted' },
            { new: true }
        );

        if (!item) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        res.json({ message: 'Listing removed', item });
    } catch (error) {
        res.status(500).json({ message: 'Error removing listing' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const [
            totalUsers, totalItems, totalBookings, totalTransactions,
            activeBookings, recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            Item.countDocuments({ status: { $ne: 'deleted' } }),
            Booking.countDocuments(),
            Transaction.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Booking.countDocuments({ status: { $in: ['requested', 'approved', 'active'] } }),
            User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
        ]);

        res.json({
            totalUsers,
            totalItems,
            totalBookings,
            totalRevenue: totalTransactions[0]?.total || 0,
            activeBookings,
            newUsersThisWeek: recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};
