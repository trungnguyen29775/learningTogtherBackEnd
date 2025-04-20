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

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('online', ({ user_id }) => {
        onlineUsers[user_id] = socket.id;
        console.log(`🟢 ${user_id} is online - Socket ID: ${socket.id}`);
    });

    socket.on('send-message', ({ targetUserId, message, senderId, chat_rooms_id }) => {
        const targetSocketId = onlineUsers[targetUserId];

        if (targetSocketId) {
            io.to(targetSocketId).emit('received-message', { senderId, message, chat_rooms_id });

            console.log(`📨 ${senderId} gửi tin nhắn cho ${targetUserId}: ${message}`);
        } else {
            console.log(`⚠️ User ${targetUserId} không online!`);
        }
    });

    socket.on('send-notify', ({ targetUserId, data }) => {
        const targetSocketId = onlineUsers[targetUserId];
        if (targetSocketId) {
            io.to(targetSocketId).emit('received-notify', { data });
            console.log(`gửi thông báo cho ${targetUserId}: ${data}`);
        } else {
            console.log(`⚠️ User ${targetUserId} không online!`);
        }
    });
    socket.on('disconnect', () => {
        for (let user in onlineUsers) {
            if (onlineUsers[user] === socket.id) {
                console.log(`🔴 ${user} đã offline`);
                delete onlineUsers[user];
                break;
            }
        }
    });
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Đồng bộ database
db.sequelize.sync({ alter: true });

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
