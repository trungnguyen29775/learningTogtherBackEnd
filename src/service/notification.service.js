const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const Notification = db.Notification;

exports.getNotificationsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const notifications = await Notification.findAll({
            where: { user_id },
            order: [['createdAt', 'DESC']], // Sắp xếp từ mới nhất đến cũ nhất
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const { user_id, text, status } = req.body;

        if (!user_id || !text) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newNotification = await Notification.create({
            notification_id: uuidv4(),
            user_id,
            text,
            status: status || 'unread',
        });

        res.status(201).json({ message: 'Notification created', notification: newNotification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateNotificationStatus = async (req, res) => {
    try {
        const { notification_id } = req.params;
        const { status } = req.body;

        const notification = await Notification.findByPk(notification_id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notification.update({ status });

        res.status(200).json({ message: 'Notification status updated', notification });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { notification_id } = req.params;

        const notification = await Notification.findByPk(notification_id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notification.destroy();
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
