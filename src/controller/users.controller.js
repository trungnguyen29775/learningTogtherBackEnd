module.exports = (app) => {
    const UsersService = require('../service/user.service');
    var router = require('express').Router();
    router.post('/register', UsersService.create);
    router.post('/login', UsersService.authenticate);
    router.post('/get-all', UsersService.getAll);

    app.use('/', router);
};
