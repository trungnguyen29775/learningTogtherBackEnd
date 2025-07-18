const db = require('../model');
const Users = db.Users;
const Friendship = db.Friendship;

// Get users who have liked the current user but are not yet matched
exports.getLikedYou = async (req, res) => {
    try {
        const { user_id } = req.params;
        // Find friendships where friend_id is current user and status is 'liked' (not matched or rejected)
        const likes = await Friendship.findAll({
            where: {
                friend_id: user_id,
                status: 'liked',
            },
        });
        const userIds = likes.map(like => like.user_id);
        // Get user profiles for those who liked you
        const users = await Users.findAll({
            where: { user_id: userIds },
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching liked you:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
