const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize app
const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup (FIXED)
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ✅ Middleware (FIXED CORS — FINAL)
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO - Real-time chat
const Message = require('./models/Message');
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('sendMessage', async (data) => {
        try {
            const { senderId, receiverId, content } = data;
            const chatId = Message.getChatId(senderId, receiverId);

            const message = await Message.create({
                chatId,
                sender: senderId,
                receiver: receiverId,
                content
            });

            const populated = await Message.findById(message._id)
                .populate('sender', 'name profilePhoto')
                .populate('receiver', 'name profilePhoto');

            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit('newMessage', populated);
            }

            socket.emit('messageSent', populated);
        } catch (error) {
            socket.emit('messageError', { message: 'Failed to send message' });
        }
    });

    socket.on('typing', ({ receiverId }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit('userTyping', { userId: socket.userId });
        }
    });

    socket.on('stopTyping', ({ receiverId }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit('userStopTyping', { userId: socket.userId });
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        }
        console.log('User disconnected:', socket.id);
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});

// ✅ Start server (FIXED for Render)
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Loopify Server running on port ${PORT}`);
        console.log(`📡 API: https://loopify-2.onrender.com/api`);
    });
});