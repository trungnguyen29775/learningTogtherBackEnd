const { where, Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../model/index');
const ChatRooms = db.ChatRooms;
const Friendship = db.Friendship;
const ChatFeature = db.ChatFeature;
const Message = db.Message;
const Notification = db.Notification;
exports.createFriendship = async (req, res) => {
    try {
        const { user_id, friend_id, status, currentName, targetName, currentAvtFilePath, targetAvtFilePath } = req.body;
        if (status !== 'skipped') {
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
                    await existingFriendship.update({ status: 'accepted' });
                    const chatRoom = await ChatRooms.create({
                        chat_rooms_id: uuidv4(),
                    });

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

            const newFriendship = await Friendship.create({
                friendship_id: uuidv4(),
                user_id,
                friend_id,
                status: 'pending',
            });

            res.status(201).json({ message: 'Friend request sent', friendship: newFriendship });
        } else {
            const newFriendship = await Friendship.create({
                friendship_id: uuidv4(),
                user_id,
                friend_id,
                status: 'skipped',
            });
            res.status(201).json({ message: 'Skipped', friendship: newFriendship });
        }
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

exports.updateFriendship = async (req, res) => {
    try {
        const { currentUserId, status, targetUserId } = req.body;
        console.log(currentUserId, status, targetUserId);

        // Tìm friendship
        const friendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id: currentUserId, friend_id: targetUserId },
                    { user_id: targetUserId, friend_id: currentUserId },
                ],
            },
        });

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        // Cập nhật trạng thái
        await friendship.update({ status });

        // Phản hồi thành công
        res.status(200).json({
            message: 'Friendship updated successfully',
            data: { currentUserId, status, targetUserId },
        });
    } catch (error) {
        console.error('Error updating friendship:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteFriendship = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { currentUserId, targetUserId, chat_rooms_id } = req.body;

        const friendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id: currentUserId, friend_id: targetUserId },
                    { user_id: targetUserId, friend_id: currentUserId },
                ],
            },
            transaction,
        });

        if (!friendship) {
            await transaction.rollback(); // Rollback nếu không tìm thấy
            return res.status(404).json({ message: 'Friendship not found' });
        }

        await Message.destroy({
            where: {
                chat_rooms_id: chat_rooms_id,
            },
            transaction,
        });

        await ChatFeature.destroy({
            where: {
                chat_rooms_id: chat_rooms_id,
            },
            transaction,
        });

        await ChatRooms.destroy({
            where: {
                chat_rooms_id: chat_rooms_id,
            },
            transaction,
        });

        await friendship.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({ message: 'Friendship and related data deleted successfully' });
    } catch (error) {
        await transaction.rollback(); // Rollback nếu có lỗi
        console.error('Error deleting friendship:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
