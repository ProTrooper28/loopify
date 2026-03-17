const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { generateVerificationToken, sendVerificationEmail } = require('../utils/email');

// @desc    Register new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password, university } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            university,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        // Send verification email
        await sendVerificationEmail(user, verificationToken);

        // Generate JWT
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                university: user.university,
                role: user.role,
                emailVerified: user.emailVerified,
                profilePhoto: user.profilePhoto,
                reputationScore: user.reputationScore
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been suspended' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                university: user.university,
                role: user.role,
                emailVerified: user.emailVerified,
                profilePhoto: user.profilePhoto,
                reputationScore: user.reputationScore
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: req.params.token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Server error during email verification' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            university: user.university,
            role: user.role,
            emailVerified: user.emailVerified,
            profilePhoto: user.profilePhoto,
            reputationScore: user.reputationScore,
            ratingCount: user.ratingCount,
            phone: user.phone,
            bio: user.bio,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
