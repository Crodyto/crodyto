module.exports = function(req, res, next) {
  // assumes auth middleware set req.userId
  const User = require('../models/User');
  if (!req.userId) return res.status(401).json({ message: 'Not authenticated' });
  User.findById(req.userId).then(user=>{
    if (!user) return res.status(401).json({ message: 'User not found' });
    // support legacy isAdmin flag or role === 'admin'
    if (!(user.isAdmin || user.role === 'admin')) return res.status(403).json({ message: 'Admin access required' });
    next();
  }).catch(err=> next(err));
};
