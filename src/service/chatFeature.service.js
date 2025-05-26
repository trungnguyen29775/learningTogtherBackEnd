const { ChatFeature, ChatRooms, Users } = require('../model');
const { Op } = require('sequelize');

exports.getChatFeaturesByUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        const chatFeatures = await ChatFeature.findAll({
            where: { user_id },
            attributes: ['chat_rooms_id'], // Chỉ lấy chat_rooms_id
        });

        if (!chatFeatures.length) {
            return res.status(404).json({ message: 'No chat rooms found for this user' });
        }

        const chatRoomIds = chatFeatures.map((cf) => cf.chat_rooms_id);

        const otherUsers = await ChatFeature.findAll({
            where: {
                chat_rooms_id: { [Op.in]: chatRoomIds },
                user_id: { [Op.ne]: user_id }, // Loại bỏ chính user_id
            },
            include: [
                {
                    model: Users,
                    attributes: ['user_id', 'name'],
                },
            ],
        });

        const result = otherUsers.map((cf) => ({
            chat_rooms_id: cf.chat_rooms_id,
            user_id: cf.user_id,
            name: cf.user?.name || null,
            avt_file_path: cf.user?.avt_file_path || null,
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching chat feature by user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
