const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const ChatFeature = sequelize.define(
        'chat_feature',
        {
            chat_feature_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        {
            timestamps: true,
        },
    );
    return ChatFeature;
};
