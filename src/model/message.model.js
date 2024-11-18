const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const Messages = sequelize.define(
        'messages',
        {
            messages_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            sender: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            timestamps: false,
        },
    );
    return Messages;
};
