const dbConfig = require('../config/db.config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Users = require('./users.model')(sequelize, Sequelize);
db.ChatFeature = require('./chatFeature.model')(sequelize, Sequelize);
db.ChatRooms = require('./chatRoom.model')(sequelize, Sequelize);
db.Message = require('./message.model')(sequelize, Sequelize);
db.Friendship = require('./friendship.model')(sequelize, Sequelize);
db.Notification = require('./notification.model')(sequelize, Sequelize);
db.UserImage = require('./userImage.model')(sequelize, Sequelize);
// ---------------------------------------Relation-----------------------------------------

// Chat Feature & User
db.Users.hasMany(db.ChatFeature, {
    foreignKey: 'user_id',
});

db.ChatFeature.belongsTo(db.Users, {
    foreignKey: 'user_id',
});

// Chat Rooms & Chat Feature

db.ChatFeature.belongsTo(db.ChatRooms, {
    foreignKey: 'chat_rooms_id',
});

db.ChatRooms.hasMany(db.ChatFeature, {
    foreignKey: 'chat_rooms_id',
});
// Chat Rooms & Messages

db.Message.belongsTo(db.ChatRooms, {
    foreignKey: 'chat_rooms_id',
});

db.ChatRooms.hasMany(db.Message, {
    foreignKey: 'chat_rooms_id',
});

// Friendship
db.Friendship.belongsTo(db.Users, {
    foreignKey: 'user_id',
});

db.Users.hasMany(db.Friendship, {
    foreignKey: 'user_id',
});

// Notification
db.Notification.belongsTo(db.Users, {
    foreignKey: 'user_id',
});

db.Users.hasMany(db.Notification, {
    foreignKey: 'user_id',
});

// User Image

db.UserImage.belongsTo(db.Users, {
    foreignKey: 'user_id',
});

db.Users.hasMany(db.UserImage, {
    foreignKey: 'user_id',
});

module.exports = db;
