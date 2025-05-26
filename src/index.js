const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const db = require('./model');
const httpServer = createServer(app);
const port = 5000;

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

// Lưu danh sách user online và socket ID của họ
const onlineUsers = {};
const quickChatQueue = [];
const activeChats = new Map(); // chatId -> {user1: {socketId, userId}, user2: {socketId, userId}, interests}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('online', ({ user_id }) => {
        onlineUsers[user_id] = socket.id;
        console.log(`🟢 ${user_id} is online - Socket ID: ${socket.id}`);
    });

    // Regular messaging
    socket.on('send-message', ({ targetUserId, message, senderId, chat_rooms_id }) => {
        const targetSocketId = onlineUsers[targetUserId];
        if (targetSocketId) {
            io.to(targetSocketId).emit('received-message', { senderId, message, chat_rooms_id });
            console.log(`📨 ${senderId} gửi tin nhắn cho ${targetUserId}: ${message}`);
        } else {
            console.log(`⚠️ User ${targetUserId} không online!`);
        }
    });

    // Notifications
    socket.on('send-notify', ({ targetUserId, data }) => {
        const targetSocketId = onlineUsers[targetUserId];
        if (targetSocketId) {
            io.to(targetSocketId).emit('received-notify', { data });
            console.log(`gửi thông báo cho ${targetUserId}: ${data}`);
        } else {
            console.log(`⚠️ User ${targetUserId} không online!`);
        }
    });

    // Quick Chat functionality
    socket.on('join-quick-chat', ({ userId, interests }, callback) => {
        // Check if user is already in queue or in a chat
        if (isUserInQuickChat(userId)) {
            return callback({ error: 'Bạn đã tham gia chat nhanh rồi' });
        }

        const userData = { socketId: socket.id, userId, interests };

        // Try to find a match
        const matchIndex = quickChatQueue.findIndex((u) => hasMatchingInterests(u.interests, interests));

        if (matchIndex !== -1) {
            // Found a match
            const partner = quickChatQueue[matchIndex];
            quickChatQueue.splice(matchIndex, 1);

            const chatId = generateChatId();
            activeChats.set(chatId, {
                user1: partner,
                user2: userData,
                interests: getCommonInterests(partner.interests, interests),
                timer: setTimeout(() => endChat(chatId), 600000), // 10 minutes
            });

            // Notify both users
            io.to(partner.socketId).emit('chat-started', {
                chatId,
                partnerInterests: interests,
            });
            io.to(socket.id).emit('chat-started', {
                chatId,
                partnerInterests: partner.interests,
            });

            callback({ success: true });
        } else {
            // Add to queue
            quickChatQueue.push(userData);
            callback({ success: true, status: 'waiting' });
        }
    });

    socket.on('send-chat-message', ({ chatId, message }) => {
        const chat = activeChats.get(chatId);
        if (!chat) return;

        const isUser1 = chat.user1.socketId === socket.id;
        const targetSocket = isUser1 ? chat.user2.socketId : chat.user1.socketId;

        io.to(targetSocket).emit('new-message', {
            message,
            isPartner: true,
        });
    });

    socket.on('like-partner', ({ chatId }) => {
        const chat = activeChats.get(chatId);
        if (!chat) return;

        const isUser1 = chat.user1.socketId === socket.id;

        if (isUser1) {
            chat.user1Liked = true;
        } else {
            chat.user2Liked = true;
        }

        // Check if both liked each other
        if (chat.user1Liked && chat.user2Liked) {
            clearTimeout(chat.timer);

            io.to(chat.user1.socketId).emit('match-made', {
                partnerId: chat.user2.userId,
                partnerInterests: chat.user2.interests,
                sharedInterests: chat.interests,
            });

            io.to(chat.user2.socketId).emit('match-made', {
                partnerId: chat.user1.userId,
                partnerInterests: chat.user1.interests,
                sharedInterests: chat.interests,
            });

            activeChats.delete(chatId);
        }
    });

    socket.on('leave-chat', ({ chatId }) => {
        endChat(chatId, 'Đối phương đã rời khỏi cuộc trò chuyện');
    });

    socket.on('disconnect', () => {
        // Handle regular online status
        for (let user in onlineUsers) {
            if (onlineUsers[user] === socket.id) {
                console.log(`🔴 ${user} đã offline`);
                delete onlineUsers[user];
                break;
            }
        }

        // Handle quick chat disconnections
        handleQuickChatDisconnect(socket.id);
    });

    // Helper functions
    function isUserInQuickChat(userId) {
        // Check queue
        if (quickChatQueue.some((u) => u.userId === userId)) return true;

        // Check active chats
        for (const [_, chat] of activeChats) {
            if (chat.user1.userId === userId || chat.user2.userId === userId) return true;
        }

        return false;
    }

    function handleQuickChatDisconnect(socketId) {
        // Check queue
        const queueIndex = quickChatQueue.findIndex((u) => u.socketId === socketId);
        if (queueIndex !== -1) {
            quickChatQueue.splice(queueIndex, 1);
            return;
        }

        // Check active chats
        for (const [chatId, chat] of activeChats) {
            if (chat.user1.socketId === socketId || chat.user2.socketId === socketId) {
                endChat(chatId, 'Đối phương đã ngắt kết nối');
                break;
            }
        }
    }

    function endChat(chatId, reason) {
        const chat = activeChats.get(chatId);
        if (!chat) return;

        clearTimeout(chat.timer);

        io.to(chat.user1.socketId).emit('chat-ended', { reason });
        io.to(chat.user2.socketId).emit('chat-ended', { reason });

        activeChats.delete(chatId);
    }

    function hasMatchingInterests(interests1, interests2) {
        return interests1.some((i) => interests2.includes(i));
    }

    function getCommonInterests(interests1, interests2) {
        return interests1.filter((i) => interests2.includes(i));
    }

    function generateChatId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Đồng bộ database
// db.sequelize.sync({ alter: true });

// Routes
require('./controller/users.controller')(app);
require('./controller/friendship.controller')(app);
require('./controller/chatFeature.controller')(app);
require('./controller/message.controller')(app);
require('./controller/notification.controller')(app);
require('./controller/userImage.controller')(app);

// Khởi chạy server
httpServer.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
