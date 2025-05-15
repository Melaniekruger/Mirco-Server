const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');

// 📌 POST /api/submissions – Student submits an assignment
router.post(
  '/',
  authenticateToken,
  authorizeRoles('student'),
  [
    body('assignmentId').notEmpty().withMessage('Assignment ID is required'),
    body('content').notEmpty().withMessage('Submission content is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { assignmentId, content } = req.body;

    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

      const submission = new Submission({
        assignment: assignmentId,
        student: req.user.id,
        content
      });

      await submission.save();
      res.status(201).json(submission);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// 📌 GET /api/submissions – Admin views all submissions
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const submissions = await Submission.find()
        .populate('student', 'username')
        .populate('assignment', 'title');
      res.json(submissions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// 📌 PUT /api/submissions/:id/feedback – Admin gives feedback/mark
router.put(
  '/:id/feedback',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('feedback').optional().isString(),
    body('mark').optional().isNumeric()
  ],
  async (req, res) => {
    const { feedback, mark } = req.body;

    // Debugging: Log the submissionId received from the URL parameter
    console.log('Received feedback for submission ID:', req.params.id);

    try {
      const submission = await Submission.findById(req.params.id);
      if (!submission) {
        console.log('Submission not found for ID:', req.params.id);
        return res.status(404).json({ msg: 'Submission not found' });
      }

      if (feedback) submission.feedback = feedback;
      if (mark !== undefined) submission.mark = mark;

      await submission.save();
      res.json(submission);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
