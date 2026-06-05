// roleMiddleware: pass allowed roles array e.g. ['admin','sub-admin']
module.exports = function(allowedRoles) {
  return function(req, res, next) {
    const User = require('../models/User');
    if (!req.userId) return res.status(401).json({ message: 'Not authenticated' });
    User.findById(req.userId).then(user=>{
      if (!user) return res.status(401).json({ message: 'User not found' });
      // admin always allowed
      if (user.isAdmin || user.role === 'admin') return next();
      if (!allowedRoles || allowedRoles.length===0) return res.status(403).json({ message: 'Access denied' });
      if (allowedRoles.includes(user.role)) return next();
      return res.status(403).json({ message: 'Insufficient role permissions' });
    }).catch(err=> next(err));
  };
};
