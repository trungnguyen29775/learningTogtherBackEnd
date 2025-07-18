module.exports = (app) => {
    const FriendshipService = require('../service/friendship.service');
    const updateFriendshipFromNotification = require('../service/updateFriendshipFromNotification');
    var router = require('express').Router();

    router.post('/create-friendship', FriendshipService.createFriendship);
    // router.get('/get-all-friendships', FriendshipService.getAllFriendships);
    router.get('/get-friendship/:id', FriendshipService.getFriendshipById);
    router.get('/get-user-friends/:user_id', FriendshipService.getUserFriends);
    router.post('/update-friendship-from-notification', updateFriendshipFromNotification);
    router.put('/update-friendship', FriendshipService.updateFriendship);
    router.delete('/delete-friendship', FriendshipService.deleteFriendship);

    app.use('/', router);
};
