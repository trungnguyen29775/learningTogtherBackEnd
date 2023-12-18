const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define(
        'users',
        {
            user_name: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            avt_file_path: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: false,
        },
    );
    return Users;
};
