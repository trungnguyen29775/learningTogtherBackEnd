const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const UserImage = sequelize.define(
        'user_image',
        {
            user_image_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: true,
        },
    );
    return UserImage;
};
