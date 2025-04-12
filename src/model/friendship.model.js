const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Friendship = sequelize.define(
        'Friendship',
        {
            friendship_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },

            friend_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('pending', 'accepted', 'blocked', 'skipped', 'unmatched'),
                allowNull: false,
                defaultValue: 'pending',
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'friendships',
        },
    );

    return Friendship;
};
