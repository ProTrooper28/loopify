const express = require('express');
const router = express.Router();
const {
    getAllUsers, getAllListings, getAllTransactions,
    toggleBanUser, removeListing, getStats
} = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(auth, admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/listings', getAllListings);
router.get('/transactions', getAllTransactions);
router.patch('/users/:id/ban', toggleBanUser);
router.delete('/listings/:id', removeListing);

module.exports = router;
