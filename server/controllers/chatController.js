const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get messages for a chat
// @route   GET /api/chat/:chatId
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
            .populate('sender', 'name profilePhoto')
            .populate('receiver', 'name profilePhoto')
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        // Get distinct chatIds for the user
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: req.user._id },
                        { receiver: req.user._id }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$chatId',
                    lastMessage: { $first: '$content' },
                    lastMessageAt: { $first: '$createdAt' },
                    sender: { $first: '$sender' },
                    receiver: { $first: '$receiver' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiver', req.user._id] },
                                        { $eq: ['$read', false] }
                                    ]
                                },
                                1, 0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { lastMessageAt: -1 }
            }
        ]);

        // Populate other user info
        const conversations = await Promise.all(
            messages.map(async (msg) => {
                const otherUserId = msg.sender.toString() === userId ? msg.receiver : msg.sender;
                const otherUser = await User.findById(otherUserId).select('name profilePhoto');
                return {
                    chatId: msg._id,
                    otherUser,
                    lastMessage: msg.lastMessage,
                    lastMessageAt: msg.lastMessageAt,
                    unreadCount: msg.unreadCount
                };
            })
        );

        res.json(conversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

// @desc    Send message (REST fallback)
// @route   POST /api/chat/send
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        const chatId = Message.getChatId(req.user._id.toString(), receiverId);

        const message = await Message.create({
            chatId,
            sender: req.user._id,
            receiver: receiverId,
            content
        });

        await message.populate('sender', 'name profilePhoto');
        await message.populate('receiver', 'name profilePhoto');

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
};

// @desc    Mark messages as read
// @route   PATCH /api/chat/:chatId/read
exports.markAsRead = async (req, res) => {
    try {
        await Message.updateMany(
            { chatId: req.params.chatId, receiver: req.user._id, read: false },
            { read: true }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages as read' });
    }
};
