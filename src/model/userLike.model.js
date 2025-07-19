module.exports = (sequelize, DataTypes) => {
  const UserLike = sequelize.define('UserLike', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    liked_user_id: { type: DataTypes.STRING, allowNull: false },
  });
  return UserLike;
};
