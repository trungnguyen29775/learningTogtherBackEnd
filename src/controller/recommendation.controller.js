const db = require('../model');
const { Op } = db.Sequelize;
const User = db.Users;
const UserLike = db.UserLike;
const UserPriority = db.UserPriority;

module.exports = (app) => {
  // Recommend users based on hobby similarity and previous likes
  app.post('/api/recommend', async (req, res) => {
    const { user_id } = req.body;
    const currentUser = await User.findByPk(user_id);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });
    const allUsers = await User.findAll({ where: { user_id: { [Op.ne]: user_id } } });
    const likes = await UserLike.findAll({ where: { user_id } });
    const priority = await UserPriority.findOne({ where: { user_id } });
    // Default priorities if not set
    const weights = {
      hobbies: priority?.hobbies || 1,
      movieGenres: priority?.movieGenres || 1,
      needs: priority?.needs || 1,
      school: priority?.school || 1,
      location: priority?.location || 1,
    };
    const hobbyKeys = [
      'music','game','anime','romance','action','detective','fantasy','hiking','travel','reading','pets','basketball','pickelBall','horror','sing','eat','exercise','running','badminton','walking','beach'
    ];
    const movieKeys = ['action','detective','fantasy','horror','romance'];
    const likedUserIds = likes.map(l => l.liked_user_id);
    const scored = allUsers.map(u => {
      let score = 0;
      // Hobbies
      let hobbyScore = hobbyKeys.reduce((acc, k) => acc + (currentUser[k] && u[k] ? 1 : 0), 0);
      // Movie genres
      let movieScore = movieKeys.reduce((acc, k) => acc + (currentUser[k] && u[k] ? 1 : 0), 0);
      // Needs
      let needsScore = currentUser.needs === u.needs ? 1 : 0;
      // School
      let schoolScore = currentUser.school && u.school && currentUser.school === u.school ? 1 : 0;
      // Location (simple: within 10km)
      let locationScore = 0;
      if (currentUser.latitude && currentUser.longitude && u.latitude && u.longitude) {
        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371; // km
        const dLat = toRad(u.latitude - currentUser.latitude);
        const dLon = toRad(u.longitude - currentUser.longitude);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(currentUser.latitude)) * Math.cos(toRad(u.latitude)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        if (distance <= 10) locationScore = 1;
      }
      // Likes
      let likeScore = likedUserIds.includes(u.user_id) ? 1 : 0;
      score = hobbyScore * weights.hobbies + movieScore * weights.movieGenres + needsScore * weights.needs + schoolScore * weights.school + locationScore * weights.location + likeScore;
      return { ...u.dataValues, score };
    });
    scored.sort((a, b) => b.score - a.score);
    res.json({ recommendations: scored.slice(0, 10) });
  });

  // Store like action
  app.post('/api/like', async (req, res) => {
    const { user_id, liked_user_id } = req.body;
    if (!user_id || !liked_user_id) return res.status(400).json({ error: 'Missing user_id or liked_user_id' });
    await UserLike.create({ user_id, liked_user_id });
    res.json({ status: 'success' });
  });
};
