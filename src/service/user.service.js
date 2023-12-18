const db = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const Users = db.Users;

exports.create = async (req, res) => {
    try {
        const { name, username, password } = req.body;
        if (!name || !username || !password) {
            return res.status(400).send('Name, username, and password are required.');
        }

        const newUser = {
            name,
            username,
            password,
        };

        await Users.create(newUser);
        res.status(200).send('User created successfully!');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.authenticate = async (req, res) => {
    Users.findOne({
        where: {
            user_name: req.body.userName,
        },
    })
        .then((result) => {
            const userData = result.dataValues;

            if (userData.password === req.body.password) {
                res.status(200).json({
                    message: 'Authentication successful',
                });
            } else {
                res.status(200).json({
                    message: 'Authentication failed',
                    error: 'Invalid username or password',
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Some error occurred while retrieving User.',
            });
        });
};
