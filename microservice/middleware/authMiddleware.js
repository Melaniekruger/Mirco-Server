// routes/authMiddleware.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Access denied. Token missing." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // <- this should include both id and username
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  //jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //if (err) return res.status(403).json({ message: "Invalid or expired token." });

    //req.user = user; // add user to request
    //next();
  //});
}

module.exports = authenticateToken;
