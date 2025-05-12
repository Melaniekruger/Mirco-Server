const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const statusMonitor = require('express-status-monitor');

// Limit to 5 requests every 10 minutes per IP
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many attempts from this IP, please try again after 10 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

dotenv.config();
const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use('/api/auth/register', authLimiter);

app.use(statusMonitor());
app.get('/status', statusMonitor().pageRoute);

app.use('/api/auth', require('./routes/auth'));

app.use('/api/assignments', require('./routes/Assignment'));
app.use('/api/submissions', require('./routes/submission'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

