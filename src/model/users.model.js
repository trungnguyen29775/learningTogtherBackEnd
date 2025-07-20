const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define(
        'users',
        {
            user_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            slogan: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            dob: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            school: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            major: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            needs: {
                type: Sequelize.ENUM('findTutor', 'studyBuddy', 'sharedHobby', ''),
                allowNull: true,
            },
            sex: {
                type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
                allowNull: false,
                defaultValue: 'male',
            },
            music: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            game: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            sing: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            eat: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            exercise: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            running: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            badminton: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            walking: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            beach: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            hiking: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            travel: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            reading: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            pets: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            basketball: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            pickelBall: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            horror: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            anime: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            romance: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            action: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            detective: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            fantasy: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            latitude: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            longitude: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            favoriteHobbies: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            favoriteMovies: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            role:{
                type: Sequelize.ENUM('user', 'admin'),
                allowNull: false,   
                defaultValue: 'user',
            }
        },
        {
            timestamps: false,
        },
    );
    return Users;
};
