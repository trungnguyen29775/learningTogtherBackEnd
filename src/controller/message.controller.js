module.exports = (app) => {
    const MessageService = require('../service/message.service');
    var router = require('express').Router();
    router.post('/create-message', MessageService.createMessage);
    router.get('/get-message/:id', MessageService.getMessageById);
    router.get('/get-messages-by-chat-room/:chat_rooms_id', MessageService.getMessagesByChatRoom);
    router.put('/update-message/:id', MessageService.updateMessage);
    router.delete('/delete-message/:id', MessageService.deleteMessage);

    app.use('/', router);
};
