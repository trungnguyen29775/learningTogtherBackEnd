module.exports = (sequelize, DataTypes) => {
  const UserPriority = sequelize.define('UserPriority', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    hobbies: { type: DataTypes.INTEGER, defaultValue: 1 },
    movieGenres: { type: DataTypes.INTEGER, defaultValue: 1 },
    needs: { type: DataTypes.INTEGER, defaultValue: 1 },
    school: { type: DataTypes.INTEGER, defaultValue: 1 },
    location: { type: DataTypes.INTEGER, defaultValue: 1 },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
  return UserPriority;
};
