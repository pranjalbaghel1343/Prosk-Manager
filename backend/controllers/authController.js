const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─────────────────────────────────────────────
//  REGISTER
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, otp, otp_expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [name, email, passwordHash, otp, otpExpiresAt]
    );

    const user = result.rows[0];
    console.log(`📧 OTP for ${email}: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! OTP sent to your email.',
      userId: user.id,
      otp: otp, // Remove in production
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  VERIFY OTP
// ─────────────────────────────────────────────
const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required.' });
    }

    const result = await pool.query(
      'SELECT id, name, email, otp, otp_expires_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    await pool.query(
      'UPDATE users SET otp_verified = TRUE, otp = NULL, otp_expires_at = NULL WHERE id = $1',
      [userId]
    );

    const token = generateToken(user.id, user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash, otp_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  RESEND OTP
// ─────────────────────────────────────────────
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const userId = result.rows[0].id;

    await pool.query(
      'UPDATE users SET otp = $1, otp_expires_at = $2, otp_verified = FALSE WHERE id = $3',
      [otp, otpExpiresAt, userId]
    );

    console.log(`📧 New OTP for ${email}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully.',
      userId,
      otp, // Remove in production
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  GET ME
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyOTP, login, resendOTP, getMe };
