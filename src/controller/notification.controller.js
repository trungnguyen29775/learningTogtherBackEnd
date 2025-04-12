module.exports = (app) => {
    const notificationService = require('../service/notification.service');
    var router = require('express').Router();

    router.post('/create-notification', notificationService.createNotification);
    router.get('/get-notification-by-user/:user_id', notificationService.getNotificationsByUser);
    app.use('/', router);
};
