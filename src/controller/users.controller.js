module.exports = (app) => {
    const UsersService = require('../service/user.service');
    var router = require('express').Router();

    router.post('/register', UsersService.create);
    router.post('/login', UsersService.authenticate);
    router.post('/get-all-user', UsersService.getAll);
    router.post('/update-hobby', UsersService.updateHobby);
    router.post('/update-profile', UsersService.updateProfile);
    router.get('/get-profile/:userId', UsersService.getProfile);

    app.use('/', router);
};
