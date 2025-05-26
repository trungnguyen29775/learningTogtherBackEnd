const { v4: uuidv4 } = require('uuid');
const db = require('../model');
const UserImage = db.UserImage;
const Users = db.Users;

// Tạo mới user image
exports.createUserImage = async (req, res) => {
    try {
        const { user_id, path, is_featured } = req.body;

        if (!user_id || !path) {
            return res.status(400).json({ message: 'Missing required fields: user_id and path' });
        }

        // Kiểm tra user tồn tại
        const user = await Users.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newUserImage = await UserImage.create({
            user_image_id: uuidv4(),
            user_id,
            path,
            is_featured,
        });

        res.status(201).json({
            message: 'User image created successfully',
            imageData: newUserImage,
        });
    } catch (error) {
        console.error('Error creating user image:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Lấy user image bằng ID
exports.getUserImageById = async (req, res) => {
    try {
        const { user_image_id } = req.body;
        const userImage = await UserImage.findOne({
            where: {
                user_image_id,
            },
        });

        if (!userImage) {
            return res.status(404).json({ message: 'User image not found' });
        }

        res.status(200).json(userImage);
    } catch (error) {
        console.error('Error fetching user image:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Lấy tất cả images của một user
exports.getImagesByUserId = async (req, res) => {
    try {
        const user_id = req.params.userId;
        // Kiểm tra user tồn tại
        const user = await Users.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userImages = await UserImage.findAll({
            where: { user_id },
            order: [['createdAt', 'DESC']], // Sắp xếp mới nhất trước
        });

        res.status(200).json(userImages);
    } catch (error) {
        console.error('Error fetching user images:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Cập nhật user image
exports.updateUserImage = async (req, res) => {
    try {
        const { path, is_featured, user_image_id } = req.body;

        if (!path) {
            return res.status(400).json({ message: 'Path is required' });
        }

        const userImage = await UserImage.findOne({
            where: {
                user_image_id,
            },
        });
        if (!userImage) {
            return res.status(404).json({ message: 'User image not found' });
        }

        await userImage.update({ path, is_featured });

        res.status(200).json({
            message: 'User image updated successfully',
            imageData: userImage,
        });
    } catch (error) {
        console.error('Error updating user image:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Xóa user image
exports.deleteUserImage = async (req, res) => {
    try {
        const { user_image_id } = req.body;
        console.log('asldlasdasd: ', req.body);
        const userImage = await UserImage.findOne({
            where: {
                user_image_id,
            },
        });
        if (!userImage) {
            return res.status(404).json({ message: 'User image not found' });
        }

        await userImage.destroy();
        res.status(200).json({ message: 'User image deleted successfully' });
    } catch (error) {
        console.error('Error deleting user image:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
