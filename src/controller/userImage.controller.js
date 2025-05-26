module.exports = (app) => {
    const UserImageService = require('../service/userImage.service');
    var router = require('express').Router();
    router.post('/create-image', UserImageService.createUserImage);
    router.get('/get-image/:imageId', UserImageService.getUserImageById);
    router.get('/get-user-images/:userId', UserImageService.getImagesByUserId);
    router.post('/update-image', UserImageService.updateUserImage);
    router.delete('/delete-image', UserImageService.deleteUserImage);
    app.use('/user-image', router);
};
