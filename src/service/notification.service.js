const { v4: uuidv4 } = require('uuid');
const db = require('../model');
const Notification = db.Notification;

const Users = db.Users;
const UserImage = db.UserImage;

exports.getNotificationsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const notifications = await Notification.findAll({
            where: { user_id },
            order: [['createdAt', 'DESC']],
        });

        // For each notification, fetch sender user data and images
        const notificationsWithUser = await Promise.all(
            notifications.map(async (notification) => {
                // Try to extract sender_id from notification text or add sender_id to notification model if possible
                // For now, assume sender_id is in notification.data or notification.friend_id (if available)
                let senderId = notification.data?.sender_id || notification.data?.friend_id || notification.friend_id;
                // Fallback: try to parse from text (not robust)
                if (!senderId && notification.text) {
                    // Example: "Bạn đã match với [name]" (not enough info for id)
                    senderId = null;
                }
                let senderUser = null;
                let senderImages = [];
                if (senderId) {
                    senderUser = await Users.findOne({ where: { user_id: senderId } });
                    senderImages = await UserImage.findAll({ where: { user_id: senderId } });
                }
                return {
                    ...notification.toJSON(),
                    otherUser: senderUser ? senderUser.toJSON() : null,
                    otherUserImages: senderImages.map(img => img.toJSON()),
                };
            })
        );
        res.status(200).json(notificationsWithUser);
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
