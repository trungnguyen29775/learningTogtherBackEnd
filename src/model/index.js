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

// ---------------------------------------Relation-----------------------------------------

// Chat Feature & User
db.ChatFeature.hasMany(db.Users, {
    foreignKey: 'chat_feature_id',
});

db.Users.belongsTo(db.ChatFeature, {
    foreignKey: 'chat_feature_id',
});

// Chat Rooms & Chat Feature

db.ChatRooms.belongsTo(db.ChatFeature, {
    foreignKey: 'chat_feature_id',
});

db.ChatFeature.hasMany(db.ChatRooms, {
    foreignKey: 'chat_feature_id',
});
// Chat Rooms & Messages

db.Message.belongsTo(db.ChatRooms, {
    foreignKey: 'chat_rooms_id',
});

db.ChatRooms.hasMany(db.Message, {
    foreignKey: 'chat_rooms_id',
});
module.exports = db;
