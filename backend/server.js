require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin for the sake of the assignment/Vercel preview URLs
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ─────────────────────────────
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ─── Health Check ───────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      success: true,
      message: '✅ Prosk Manager API is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: err.message,
    });
  }
});

// ─── API Routes ─────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);

// ─── 404 Handler ────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ───────────────────────
app.use(errorHandler);

// ─── Initialize DB & Start ──────────────────────
const initDB = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    app.listen(PORT, () => {
      console.log(`\n🚀 Prosk Manager API running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('Please make sure PostgreSQL is running and the .env file is configured correctly.');
    process.exit(1);
  }
};

initDB();

module.exports = app;
