const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define(
        'notification',
        {
            notification_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            text: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: false,
        },
    );
    return Notification;
};
