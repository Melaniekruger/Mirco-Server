const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware'); // Make sure the path is correct
const router = express.Router();
const authorizeRoles = require('../middleware/roleMiddleware');
const loginAttempts = new Map();
const logger = require('../logger'); // adjust path if needed
const { body, validationResult } = require('express-validator');


// Register route
router.post('/register', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'student']).withMessage('Role must be admin or student')
], async (req, res) => {
  console.log('📩 Register route hit with body:', req.body); 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role} = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword, role: role || 'student' });
    await user.save();

    const payload = { user: { id: user._id, username: user.username, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, password } = req.body;
  const ip = req.ip;

  const now = Date.now();
  let attemptInfo = loginAttempts.get(ip) || { count: 0, lastAttempt: now };

  if (now - attemptInfo.lastAttempt > 10 * 60 * 1000) {
    attemptInfo = { count: 0, lastAttempt: now };
    loginAttempts.set(ip, attemptInfo);
  }

  if (attemptInfo.count >= 5) {
    logger.warn(`IP ${ip} blocked after 5 failed attempts.`);
    return res.status(429).json({ msg: 'Too many failed login attempts. Try again in 10 minutes.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      attemptInfo.count++;
      attemptInfo.lastAttempt = now;
      loginAttempts.set(ip, attemptInfo);
      logger.error(`Login failed - user not found: ${username}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      attemptInfo.count++;
      attemptInfo.lastAttempt = now;
      loginAttempts.set(ip, attemptInfo);
      logger.error(`Login failed - incorrect password for user: ${username}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Success
    loginAttempts.delete(ip);
    logger.info(`User ${username} logged in successfully from IP ${ip}`);

    const payload = { user: { id: user._id, username: user.username, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    logger.error(`Server error during login for user ${username}: ${err.message}`);
    res.status(500).send('Server error');
  }
});

  module.exports = router;