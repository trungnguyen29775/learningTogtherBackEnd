const db = require('../model');
const UserPriority = db.UserPriority;

module.exports = (app) => {
  // Get user priority
  app.get('/api/user-priority/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const priority = await UserPriority.findOne({ where: { user_id } });
    res.json(priority || {});
  });

  // Set/update user priority
  app.post('/api/user-priority', async (req, res) => {
    const { user_id, hobbies, movieGenres, needs, school, location } = req.body;
    try {
      let priority = await UserPriority.findOne({ where: { user_id } });
      if (priority) {
        // Only update provided fields
        const updateFields = {};
        if (hobbies !== undefined) updateFields.hobbies = hobbies;
        if (movieGenres !== undefined) updateFields.movieGenres = movieGenres;
        if (needs !== undefined) updateFields.needs = needs;
        if (school !== undefined) updateFields.school = school;
        if (location !== undefined) updateFields.location = location;
        await priority.update(updateFields);
      } else {
        priority = await UserPriority.create({ user_id, hobbies, movieGenres, needs, school, location });
      }
      res.json({ status: 'success', priority });
    } catch (err) {
      console.error('Error updating priority:', err);
      res.status(500).json({ status: 'error', message: 'Failed to update priority', error: err });
    }
  });
};
