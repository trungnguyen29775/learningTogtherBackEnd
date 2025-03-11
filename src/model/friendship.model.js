const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const Friendship = sequelize.define(
        'friendship',
        {
            friendship_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            friend_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: false,
        },
    );
    return Friendship;
};
