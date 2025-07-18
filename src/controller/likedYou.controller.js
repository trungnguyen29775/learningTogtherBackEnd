module.exports = (app) => {
    const likedYouService = require('../service/likedYou.service');
    var router = require('express').Router();

    router.get('/get-liked-you/:user_id', likedYouService.getLikedYou);
    app.use('/', router);
};
