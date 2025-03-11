module.exports = (app) => {
    var router = require('express').Router();
    const chatFeatureController = require('../service/chatFeature.service');
    router.get('/get-chat-feature/:user_id', chatFeatureController.getChatFeaturesByUser);
    app.use('/', router);
};
