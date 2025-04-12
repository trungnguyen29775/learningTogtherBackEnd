module.exports = (app) => {
    const FriendshipService = require('../service/friendship.service');
    var router = require('express').Router();

    router.post('/create-friendship', FriendshipService.createFriendship);
    // router.get('/get-all-friendships', FriendshipService.getAllFriendships);
    router.get('/get-friendship/:id', FriendshipService.getFriendshipById);
    router.put('/update-friendship', FriendshipService.updateFriendship);
    router.delete('/delete-friendship', FriendshipService.deleteFriendship);

    app.use('/', router);
};
