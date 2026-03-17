const express = require('express');
const router = express.Router();
const {
    createBooking, getMyBookings, getBookingRequests,
    approveBooking, rejectBooking, uploadPickupPhoto,
    uploadReturnPhoto, completeBooking, getBooking
} = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getMyBookings);
router.get('/requests', auth, getBookingRequests);
router.get('/:id', auth, getBooking);
router.patch('/:id/approve', auth, approveBooking);
router.patch('/:id/reject', auth, rejectBooking);
router.patch('/:id/pickup', auth, upload.single('photo'), uploadPickupPhoto);
router.patch('/:id/return', auth, upload.single('photo'), uploadReturnPhoto);
router.patch('/:id/complete', auth, completeBooking);

module.exports = router;
