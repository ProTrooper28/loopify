const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, refundDeposit, getTransactions } = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

router.post('/create-order', auth, createOrder);
router.post('/verify', auth, verifyPayment);
router.post('/refund/:bookingId', auth, refundDeposit);
router.get('/transactions', auth, getTransactions);

module.exports = router;
