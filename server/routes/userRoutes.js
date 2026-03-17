const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, uploadProfilePhoto } = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/:id', getUserProfile);
router.put('/profile', auth, updateProfile);
router.put('/profile-photo', auth, upload.single('photo'), uploadProfilePhoto);

module.exports = router;
