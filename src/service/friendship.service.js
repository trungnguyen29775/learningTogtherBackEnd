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
        const { user_id, friend_id, status } = req.body;

        if (status !== 'skipped') {
            // Get featured avatars and names for both users
            const userAvt = await db.UserImage.findOne({ where: { user_id, is_featured: true } });
            const friendAvt = await db.UserImage.findOne({ where: { user_id: friend_id, is_featured: true } });
            const user = await db.Users.findByPk(user_id);
            const friend = await db.Users.findByPk(friend_id);

            // Check for existing friendship in either direction
            let existingFriendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { user_id: user_id, friend_id: friend_id },
                        { user_id: friend_id, friend_id: user_id },
                    ],
                },
            });

            // If a reciprocal pending friendship exists, auto-accept and create chat room
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

                    // Notify both users about the match, include avatar and name
                    await Notification.create({
                        notification_id: uuidv4(),
                        user_id: user_id,
                        text: `You have a new match with ${friend?.name || 'your friend'}! Accept or reject?`,
                        status: 'action_required',
                        otherUserAvt: friendAvt ? friendAvt.path : '',
                        otherUserName: friend?.name || '',
                    });
                    await Notification.create({
                        notification_id: uuidv4(),
                        user_id: friend_id,
                        text: `You have a new match with ${user?.name || 'your friend'}! Accept or reject?`,
                        status: 'action_required',
                        otherUserAvt: userAvt ? userAvt.path : '',
                        otherUserName: user?.name || '',
                    });

                    return res.status(200).json({
                        message: 'Friendship accepted & Chat room created',
                        friendship: existingFriendship,
                        chatRoom,
                    });
                } else {
                    // If already accepted or skipped, just return the existing friendship
                    return res.status(200).json({
                        message: 'Friendship already exists',
                        friendship: existingFriendship,
                    });
                }
            }

            // If no existing friendship, create a new pending friendship
            const newFriendship = await Friendship.create({
                friendship_id: uuidv4(),
                user_id,
                friend_id,
                status: 'pending',
            });

            // Notify the friend that they have a new match request, include avatar and name
            await Notification.create({
                notification_id: uuidv4(),
                user_id: friend_id,
                text: `You have a new match with ${user?.name || 'your friend'}! Accept or reject?`,
                status: 'action_required',
                otherUserAvt: userAvt ? userAvt.path : '',
                otherUserName: user?.name || '',
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

        // Lấy thông tin user hiện tại để tính khoảng cách
        const currentUser = await db.Users.findOne({ where: { user_id } });

        const friends = await db.Users.findAll({
            where: { user_id: friendIds },
            attributes: ['user_id', 'name', 'latitude', 'longitude'],
        });

        // Hàm tính khoảng cách giữa 2 điểm (Haversine formula)
        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
            const R = 6371; // Radius of the earth in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                0.5 - Math.cos(dLat)/2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                (1 - Math.cos(dLon))/2;
            return Math.round(R * 2 * Math.asin(Math.sqrt(a)) * 10) / 10; // rounded to 0.1km
        }

        // Thêm trường distance và avatar vào từng bạn bè
        const friendsWithDistance = await Promise.all(friends.map(async friend => {
            let distance = null;
            if (currentUser && friend.latitude && friend.longitude && currentUser.latitude && currentUser.longitude) {
                distance = getDistanceFromLatLonInKm(currentUser.latitude, currentUser.longitude, friend.latitude, friend.longitude);
            }
            // Lấy avatar từ UserImage
            const avatarImage = await db.UserImage.findOne({ where: { user_id: friend.user_id, is_featured: true } });
            return {
                ...friend.toJSON(),
                distance,
                avatar: avatarImage ? avatarImage.path : '',
            };
        }));

        res.status(200).json(friendsWithDistance);
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
