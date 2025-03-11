const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.get('/:user_id', notificationController.getNotificationsByUser);

router.post('/', notificationController.createNotification);

router.put('/:notification_id', notificationController.updateNotificationStatus);

router.delete('/:notification_id', notificationController.deleteNotification);

module.exports = router;
