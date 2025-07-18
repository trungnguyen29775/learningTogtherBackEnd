const db = require('../model');
const { Op, where } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const Users = db.Users;
const ChatFeature = db.ChatFeature;
const Friendship = db.Friendship;

const SECRET_KEY = 'your_secret_key';

exports.create = async (req, res) => {
    try {
        const { name, email, password, latitude, longitude } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserId = uuidv4();

        const newUser = await Users.create({
            user_id: newUserId,
            name,
            email,
            password: hashedPassword,
            latitude: latitude || null,
            longitude: longitude || null,
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
        const user_id = req.body.user_id;
        const friendId = await Friendship.findAll({
            where: {
                user_id,
                status: {
                    [Op.or]: ['accepted', 'skipped'],
                },
            },
            attributes: ['friend_id'],
        });
        const otherFriendId = await Friendship.findAll({
            where: {
                friend_id: user_id,
                status: {
                    [Op.or]: ['accepted', 'skipped'],
                },
            },
            attributes: ['user_id'],
        });
        const result = [user_id];
        friendId.map((item) => result.push(item.friend_id));
        otherFriendId.map((item) => result.push(item.user_id));
        console.log('Ket qua', result);

        const users = await Users.findAll({
            where: {
                user_id: { [Op.notIn]: result },
            },
            attributes: {
                exclude: ['email', 'password'],
            },
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Some error occurred while retrieving Users.', error });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }
        const user = await Users.findOne({ where: { user_id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Load all user images for this user
        const userImages = await db.UserImage.findAll({ where: { user_id: userId } });
        res.status(200).json({ message: 'Profile retrieved successfully', user, userImages });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        console.log('updateProfile req.body:', req.body);
        const { email, name, dob, slogan, school, major, needs, sex, favoriteHobbies, favoriteMovies } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Validate ENUM fields
        const allowedNeeds = ['findTutor', 'studyBuddy', 'sharedHobby', ''];
        if (needs && !allowedNeeds.includes(needs)) {
            return res.status(400).json({ message: 'Invalid value for needs.' });
        }

        const updateData = { dob, slogan, school, major, needs, sex, favoriteHobbies, favoriteMovies };

        const updatedUser = await Users.update(updateData, { where: { email } });

        if (updatedUser[0] > 0) {
            return res.status(200).json({ message: 'Profile updated successfully', email, name, ...updateData });
        } else {
            res.status(400).json({ message: 'Failed to update profile. User not found or no changes.' });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Some error occurred while updating profile.', error });
    }
};

exports.updateHobby = async (req, res) => {
    try {
        const { email, user_id, name, dob, slogan, school, major, needs, sex, favorite = [], typeFilm = [] } = req.body;

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
            return res.status(200).json({ message: 'User updated successfully', email, name, user_id, ...updateData });
        } else {
            res.status(400).json({ message: 'Failed to update user data.' });
        }
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ message: 'Some error occurred while updating user data.', error });
    }
};
