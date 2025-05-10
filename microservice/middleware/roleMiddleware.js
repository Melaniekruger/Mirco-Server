// middleware/roleMiddleware.js
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Access denied: Insufficient role" });
      }
      next();
    };
  }
  
  module.exports = authorizeRoles;
  