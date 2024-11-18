const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const ChatRooms = sequelize.define(
        'chat_rooms',
        {
            chat_rooms_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        {
            timestamps: false,
        },
    );
    return ChatRooms;
};
