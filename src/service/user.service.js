const db = require('../model');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const Users = db.Users;
const ChatFeature = db.ChatFeature;

exports.create = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(name, email, password);
        if (!name || !email || !password) {
            return res.status(400).send('Name, username, and password are required.');
        }

        const newUserId = uuidv4();
        const newChatFeatureId = uuidv4();
        await ChatFeature.create({ chat_feature_id: newChatFeatureId });
        const newUser = {
            user_id: newUserId,
            name,
            email,
            password,
            chat_feature_id: newChatFeatureId,
        };
        await Users.create(newUser);
        console.log('user: ', newUserId);
        console.log('Chat: ', newChatFeatureId);

        res.status(200).send('User created successfully!');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.authenticate = async (req, res) => {
    Users.findOne({
        where: {
            email: req.body.email,
        },
    })
        .then((result) => {
            const userData = result.dataValues;

            if (userData.password === req.body.password) {
                res.status(200).json({
                    message: 'Authentication successful',
                    userData: userData,
                });
            } else {
                res.status(401).json({
                    message: 'Authentication failed',
                    error: 'Invalid password',
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Some error occurred while retrieving User.',
            });
        });
};

exports.getAll = async (req, res) => {
    Users.findAll({
        where: {
            username: {
                [Op.not]: req.body.currentUsername,
            },
        },
    })
        .then((result) => {
            // const userData = result;
            res.status(200).send(result);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Some error occurred while retrieving User.',
            });
        });
};

exports.updateHobby = async (req, res) => {
    try {
        const favoriteObject = req.body.favorite?.reduce((acc, item) => {
            acc[item.value] = item.status;
            return acc;
        }, {});

        const typeFilmObject = req.body.typeFilm?.reduce((acc, item) => {
            acc[item.value] = item.status;
            return acc;
        }, {});
        const updateData = {
            dob: req.body.dob,
            slogan: req.body.slogan,
            school: req.body.school,
            major: req.body.major,
            needs: req.body.needs,
            sex: req.body.sex,
            ...favoriteObject,
            ...typeFilmObject,
        };
        const updatedUser = await Users.update(
            {
                ...updateData,
            },
            {
                where: { email: req.body.email },
            },
        );

        if (updatedUser[0] > 0) {
            return res.status(200).send({ ...updateData, email: req.body.email, name: req.body.name });
        } else {
            res.status(201).send('Cap nhat that bai');
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Some error occurred while retrieving User.',
        });
    }
};
