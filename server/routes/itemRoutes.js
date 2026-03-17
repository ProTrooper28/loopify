const express = require('express');
const router = express.Router();
const {
    createItem, getItems, getItem, updateItem,
    updateItemStatus, getMyListings
} = require('../controllers/itemController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/my-listings', auth, getMyListings);
router.post('/', auth, upload.array('photos', 5), createItem);
router.get('/', getItems);
router.get('/:id', getItem);
router.put('/:id', auth, upload.array('photos', 5), updateItem);
router.patch('/:id/status', auth, updateItemStatus);

module.exports = router;
