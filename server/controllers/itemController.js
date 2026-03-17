const Item = require('../models/Item');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc    Create new listing
// @route   POST /api/items
exports.createItem = async (req, res) => {
    try {
        const {
            name, category, description, hourlyPrice, dailyPrice,
            securityDeposit, pickupLocation, condition, instantAccess
        } = req.body;

        // Handle photo uploads
        let photos = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToCloudinary(file.path);
                photos.push(url);
            }
        }

        const item = await Item.create({
            owner: req.user._id,
            name,
            category,
            description,
            photos,
            hourlyPrice: Number(hourlyPrice),
            dailyPrice: Number(dailyPrice),
            securityDeposit: Number(securityDeposit),
            pickupLocation,
            condition,
            instantAccess: instantAccess === 'true' || instantAccess === true
        });

        await item.populate('owner', 'name profilePhoto reputationScore university');

        res.status(201).json(item);
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ message: 'Error creating listing' });
    }
};

// @desc    Get all listings with search/filter/sort
// @route   GET /api/items
exports.getItems = async (req, res) => {
    try {
        const {
            search, category, minPrice, maxPrice, condition,
            instantAccess, sort, page = 1, limit = 12
        } = req.query;

        const query = { status: 'active' };

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Price filter (using hourly price)
        if (minPrice || maxPrice) {
            query.hourlyPrice = {};
            if (minPrice) query.hourlyPrice.$gte = Number(minPrice);
            if (maxPrice) query.hourlyPrice.$lte = Number(maxPrice);
        }

        // Condition filter
        if (condition) {
            query.condition = condition;
        }

        // Instant access filter
        if (instantAccess === 'true') {
            query.instantAccess = true;
        }

        // Sort options
        let sortOption = { createdAt: -1 }; // Default: newest
        if (sort === 'price-low') sortOption = { hourlyPrice: 1 };
        else if (sort === 'price-high') sortOption = { hourlyPrice: -1 };
        else if (sort === 'rating') sortOption = { rating: -1 };
        else if (sort === 'popular') sortOption = { totalBookings: -1 };

        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            Item.find(query)
                .populate('owner', 'name profilePhoto reputationScore university')
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            Item.countDocuments(query)
        ]);

        res.json({
            items,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ message: 'Error fetching listings' });
    }
};

// @desc    Get single item
// @route   GET /api/items/:id
exports.getItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('owner', 'name profilePhoto reputationScore university email phone bio createdAt');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item' });
    }
};

// @desc    Update item
// @route   PUT /api/items/:id
exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this listing' });
        }

        const updates = req.body;

        // Handle new photos
        if (req.files && req.files.length > 0) {
            const newPhotos = [];
            for (const file of req.files) {
                const url = await uploadToCloudinary(file.path);
                newPhotos.push(url);
            }
            updates.photos = [...(item.photos || []), ...newPhotos];
        }

        if (updates.instantAccess !== undefined) {
            updates.instantAccess = updates.instantAccess === 'true' || updates.instantAccess === true;
        }

        const updatedItem = await Item.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
            .populate('owner', 'name profilePhoto reputationScore university');

        res.json(updatedItem);
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ message: 'Error updating listing' });
    }
};

// @desc    Update item status (pause/activate/delete)
// @route   PATCH /api/items/:id/status
exports.updateItemStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!['active', 'paused', 'deleted'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        item.status = status;
        await item.save();

        res.json({ message: `Listing ${status}`, item });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
};

// @desc    Get current user's listings
// @route   GET /api/items/my-listings
exports.getMyListings = async (req, res) => {
    try {
        const items = await Item.find({ owner: req.user._id, status: { $ne: 'deleted' } })
            .sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching listings' });
    }
};
