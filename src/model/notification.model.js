const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define(
        'notification',
        {
            notification_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            text: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('unread', 'read', 'deleted', 'archived', 'action_required'),
                allowNull: false,
                defaultValue: 'unread',
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            timestamps: false,
        },
    );
    return Notification;
};
