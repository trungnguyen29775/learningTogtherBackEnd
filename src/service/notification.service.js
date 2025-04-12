const { v4: uuidv4 } = require('uuid');
const db = require('../model');
const Notification = db.Notification;

exports.getNotificationsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const notifications = await Notification.findAll({
            where: { user_id },
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const { type, data } = req.body;
        const { user_id, friend_id, currentName, targetName, currentAvtFilePath, targetAvtFilePath } = data;
        switch (type) {
            case 'matched': {
                await Notification.bulkCreate([
                    {
                        notification_id: uuidv4(),
                        text: `Bạn đã match với${currentName}`,
                        status: 'unread',
                        user_id: friend_id,
                        img_path: currentAvtFilePath,
                    },
                    {
                        notification_id: uuidv4(),
                        text: `Bạn đã match với${targetName}`,
                        status: 'unread',
                        user_id: user_id,
                        img_path: targetAvtFilePath,
                    },
                ]);
                return res.status(201).json({ message: 'Notification created' });
            }
            default: {
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        }
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
