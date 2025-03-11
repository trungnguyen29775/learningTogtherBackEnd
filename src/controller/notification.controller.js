const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.get('/get-notification/:user_id', notificationController.getNotificationsByUser);

router.post('/create-notification/', notificationController.createNotification);

router.put('/update-notification/:notification_id', notificationController.updateNotificationStatus);

router.delete('/delete-notification/:notification_id', notificationController.deleteNotification);

module.exports = router;
