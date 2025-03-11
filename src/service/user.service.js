const db = require('../model');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const Users = db.Users;
const ChatFeature = db.ChatFeature;
const SECRET_KEY = 'your_secret_key';

exports.create = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserId = uuidv4();
        const newChatFeatureId = uuidv4();
        await ChatFeature.create({ chat_feature_id: newChatFeatureId });

        const newUser = await Users.create({
            user_id: newUserId,
            name,
            email,
            password: hashedPassword,
            chat_feature_id: newChatFeatureId,
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.authenticate = async (req, res) => {
    try {
        const user = await Users.findOne({ where: { email: req.body.email } });

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed', error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Authentication failed', error: 'Invalid password' });
        }

        const token = jwt.sign({ user_id: user.user_id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });

        res.status(200).json({ message: 'Authentication successful', token, userData: user });
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Access denied' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        req.user = decoded;
        next();
    });
};

exports.getAll = async (req, res) => {
    try {
        const users = await Users.findAll({
            where: {
                user_id: { [Op.not]: req.user.user_id },
            },
        });

        const sanitizedUsers = users.map(({ password, email, chat_feature_id, ...rest }) => rest);
        res.status(200).json(sanitizedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Some error occurred while retrieving Users.', error });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile retrieved successfully', user });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { email, name, dob, slogan, school, major, needs, sex, favoriteHobbies, favoriteMovies } = req.body;

        const updateData = { dob, slogan, school, major, needs, sex, favoriteHobbies, favoriteMovies };

        const updatedUser = await Users.update(updateData, { where: { email } });

        if (updatedUser[0] > 0) {
            return res.status(200).json({ message: 'Profile updated successfully', email, name, ...updateData });
        } else {
            res.status(400).json({ message: 'Failed to update profile.' });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Some error occurred while updating profile.', error });
    }
};

exports.updateHobby = async (req, res) => {
    try {
        const { email, name, dob, slogan, school, major, needs, sex, favorite = [], typeFilm = [] } = req.body;

        const favoriteObject = favorite.reduce((acc, item) => {
            acc[item.value] = item.status;
            return acc;
        }, {});

        const typeFilmObject = typeFilm.reduce((acc, item) => {
            acc[item.value] = item.status;
            return acc;
        }, {});

        const updateData = { dob, slogan, school, major, needs, sex, ...favoriteObject, ...typeFilmObject };

        const updatedUser = await Users.update(updateData, { where: { email } });

        if (updatedUser[0] > 0) {
            return res.status(200).json({ message: 'User updated successfully', email, name, ...updateData });
        } else {
            res.status(400).json({ message: 'Failed to update user data.' });
        }
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ message: 'Some error occurred while updating user data.', error });
    }
};
