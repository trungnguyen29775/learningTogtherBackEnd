const { where, Op } = require('sequelize');
const db = require('../model'); // Đảm bảo bạn có models/index.js để kết nối DB
const { v4: uuidv4 } = require('uuid');

const ChatRooms = db.ChatRooms;
const Friendship = db.Friendship;
const ChatFeature = db.ChatFeature;

exports.createFriendship = async (req, res) => {
    try {
        const { user_id, friend_id } = req.body;

        // Kiểm tra nếu friendship đã tồn tại
        let existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id: user_id, friend_id: friend_id },
                    { user_id: friend_id, friend_id: user_id },
                ],
            },
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'pending') {
                // Cập nhật trạng thái thành 'accepted'
                await existingFriendship.update({ status: 'accepted' });

                // Tạo Chat Room mới
                const chatRoom = await ChatRooms.create({
                    chat_rooms_id: uuidv4(),
                });

                // Tạo Chat Feature cho cả hai người
                await ChatFeature.bulkCreate([
                    { chat_feature_id: uuidv4(), user_id, chat_rooms_id: chatRoom.chat_rooms_id },
                    { chat_feature_id: uuidv4(), user_id: friend_id, chat_rooms_id: chatRoom.chat_rooms_id },
                ]);

                return res.status(200).json({
                    message: 'Friendship accepted & Chat room created',
                    friendship: existingFriendship,
                    chatRoom,
                });
            }
        }

        // Nếu chưa có, tạo mới với trạng thái 'pending'
        const newFriendship = await Friendship.create({
            friendship_id: uuidv4(),
            user_id,
            friend_id,
            status: 'pending',
        });

        res.status(201).json({ message: 'Friend request sent', friendship: newFriendship });
    } catch (error) {
        console.error('Error creating friendship:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * Lấy danh sách tất cả bạn bè
 */
exports.getUserFriends = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Lấy danh sách bạn bè có trạng thái "accepted"
        const friendships = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [{ user_id }, { friend_id: user_id }],
            },
        });

        const friendIds = friendships.map((f) => (f.user_id === user_id ? f.friend_id : f.user_id));

        const friends = await User.findAll({
            where: { user_id: friendIds },
            attributes: ['user_id', 'name', 'avatar'],
        });

        res.status(200).json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * Lấy thông tin một mối quan hệ bạn bè theo ID
 */
exports.getFriendshipById = async (req, res) => {
    try {
        const { id } = req.params;
        const friendship = await Friendship.findByPk(id);

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        res.status(200).json(friendship);
    } catch (error) {
        console.error('Error fetching friendship:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * Cập nhật trạng thái mối quan hệ bạn bè
 */
exports.updateFriendship = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status là bắt buộc.' });
        }

        const updated = await Friendship.update({ status }, { where: { friendship_id: id } });

        if (updated[0] === 0) {
            return res.status(404).json({ message: 'Friendship không tồn tại hoặc không có thay đổi' });
        }

        res.status(200).json({ message: 'Friendship updated successfully' });
    } catch (error) {
        console.error('Error updating friendship:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * Xóa một mối quan hệ bạn bè theo ID
 */
exports.deleteFriendship = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Friendship.destroy({ where: { friendship_id: id } });

        if (!deleted) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        res.status(200).json({ message: 'Friendship deleted successfully' });
    } catch (error) {
        console.error('Error deleting friendship:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
