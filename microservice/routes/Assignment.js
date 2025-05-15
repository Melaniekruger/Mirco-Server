const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');

// 📌 POST /api/assignments – Admin uploads a new assignment
router.post(
  '/',
  authenticateToken, // This will populate req.user
  authorizeRoles('admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('dueDate').notEmpty().isISO8601().withMessage('Valid due date is required'),
    body('description').optional()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, dueDate } = req.body;
    //const createdBy = req.user.id; 

    try {
      // Use req.user.id to automatically set createdBy
      const assignment = new Assignment({
        title,
        description,
        dueDate
      });

      await assignment.save();
      res.status(201).json(assignment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// 📌 GET /api/assignments – Students fetch all assignments
router.get('/', authenticateToken, authorizeRoles('student', 'admin'), async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
