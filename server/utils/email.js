const crypto = require('crypto');

// Generate email verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
    // Prototypical: just log the verification link to the console
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    console.log('\n======================================');
    console.log('📧 MOCK EMAIL NOTIFICATION (dev mode)');
    console.log(`   To: ${user.email} (${user.name})`);
    console.log(`   Subject: Verify Your Loopify Account`);
    console.log(`   Link: ${verificationUrl}`);
    console.log('======================================\n');

    return true;
};

module.exports = { generateVerificationToken, sendVerificationEmail };
