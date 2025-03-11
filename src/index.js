const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { log } = require('console');
const db = require('./model');
const httpServer = createServer(app);
const port = 5000;

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);
    socket.on('online', ({ usernameOnline }) => {
        socket.join(usernameOnline);
        socket.on('send-message', ({ targetUser, message, sender }) => {
            console.log(targetUser, message, sender);
            socket.join(targetUser);
            socket.to(targetUser).emit('recieved-message', { sender: sender, message: message });
            socket.leave(targetUser);
        });
    });
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

db.sequelize.sync({ alter: true });

require('./controller/users.controller')(app);
require('./controller/friendship.controller')(app);
require('./controller/chatFeature.controller')(app);
// require('./controller/notification.controller')(app);

httpServer.listen(port, () => {
    console.log('Listen on port ', port);
});
