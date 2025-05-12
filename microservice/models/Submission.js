const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  feedback: { type: String },
  mark: { type: Number },
});

module.exports = mongoose.model('Submission', SubmissionSchema);
