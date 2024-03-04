const db = require('../model');
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
            username: req.body.username,
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
