const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');

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

    // Send the real email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to Prosk Manager!</h2>
        <p style="color: #333; font-size: 16px;">Hello <strong>${name}</strong>,</p>
        <p style="color: #333; font-size: 16px;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This code will expire in 10 minutes.</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #6366f1;">
          <h1 style="color: #6366f1; margin: 0; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: email,
      subject: 'Prosk Manager - Verify Your Email',
      html: emailHtml,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! OTP sent to your email.',
      userId: user.id,
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

    // Send the real email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Prosk Manager - New OTP</h2>
        <p style="color: #333; font-size: 16px;">You requested a new verification code. Please use the following One-Time Password (OTP) to verify your email address. This code will expire in 10 minutes.</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #6366f1;">
          <h1 style="color: #6366f1; margin: 0; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: email,
      subject: 'Prosk Manager - Your New OTP',
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully.',
      userId,
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
