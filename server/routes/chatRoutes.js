const express = require('express');
const router = express.Router();
const { getMessages, getConversations, sendMessage, markAsRead } = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.get('/conversations', auth, getConversations);
router.get('/:chatId', auth, getMessages);
router.post('/send', auth, sendMessage);
router.patch('/:chatId/read', auth, markAsRead);

module.exports = router;
