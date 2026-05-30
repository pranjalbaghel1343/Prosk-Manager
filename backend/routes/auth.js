const express = require('express');
const router = express.Router();
const { register, verifyOTP, login, resendOTP, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTP);
router.get('/me', authMiddleware, getMe);

module.exports = router;
