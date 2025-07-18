const db = require('../model');
const Notification = db.Notification;
const Friendship = db.Friendship;

module.exports = async (req, res) => {
    try {
        const { notification_id, user_id, action } = req.body;
        // Find the notification
        const notification = await Notification.findByPk(notification_id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Try to extract friend_id from notification if available, else fallback to user_id logic
        let friend_id = notification.friend_id || null;
        if (!friend_id) {
            // Try to parse from notification text if possible (customize as needed)
            // Otherwise, fallback to using notification.user_id as friend_id
            friend_id = notification.user_id;
        }

        // Find the related friendship
        const friendship = await Friendship.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    { user_id: user_id, friend_id: friend_id },
                    { user_id: friend_id, friend_id: user_id },
                ],
            },
        });
        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }
        // Update friendship status
        await friendship.update({ status: action });
        // Update notification status
        await notification.update({ status: 'read' });
        return res.status(200).json({ message: 'Friendship and notification updated' });
    } catch (error) {
        console.error('Error updating friendship from notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
