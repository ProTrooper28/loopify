const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc    Get user profile
// @route   GET /api/users/:id
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-emailVerificationToken -emailVerificationExpires');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            university: user.university,
            profilePhoto: user.profilePhoto,
            reputationScore: user.reputationScore,
            ratingCount: user.ratingCount,
            bio: user.bio,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, bio, university } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (university) user.university = university;

        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            university: user.university,
            phone: user.phone,
            bio: user.bio,
            profilePhoto: user.profilePhoto,
            reputationScore: user.reputationScore
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Upload profile photo
// @route   PUT /api/users/profile-photo
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No photo uploaded' });
        }

        const photoUrl = await uploadToCloudinary(req.file.path);
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profilePhoto: photoUrl },
            { new: true }
        );

        res.json({ profilePhoto: user.profilePhoto });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading photo' });
    }
};
