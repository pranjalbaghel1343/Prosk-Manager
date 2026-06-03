import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, verifyOTP, loginUser, resendOTP, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

// ── Login Form ────────────────────────────────────────────
const LoginForm = ({ onSwitch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser(form));
    if (res.meta.requestStatus === 'fulfilled') {
      const email = res.payload.user.email;
      if (email === 'bt24ece123@iiitn.ac.in' || email === 'bt24csa052@iiitn.ac.in') {
        navigate('/prank');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">⚠ {error}</div>}
      <div className="form-group">
        <label className="form-label">Email address</label>
        <input
          id="login-email"
          type="email"
          className="form-input"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          id="login-password"
          type="password"
          className="form-input"
          placeholder="Your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>
      <button id="login-submit" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
        {loading ? <><span className="spinner" />Signing in...</> : 'Sign In →'}
      </button>
      <div className="auth-footer">
        Don't have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitch(); }}>
          Create one
        </a>
      </div>
    </form>
  );
};

// ── OTP Verify Form ───────────────────────────────────────
const OTPForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, pendingUserId } = useSelector((s) => s.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { toast.error('Enter all 6 digits'); return; }
    const res = await dispatch(verifyOTP({ userId: pendingUserId, otp: otpStr }));
    if (res.meta.requestStatus === 'fulfilled') {
      const email = res.payload.user.email;
      if (email === 'bt24ece123@iiitn.ac.in' || email === 'bt24csa052@iiitn.ac.in') {
        navigate('/prank');
      } else {
        toast.success('Email verified! Welcome aboard 🎉');
        navigate('/dashboard');
      }
    }
  };

  const handleResend = () => {
    toast('OTP resent!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div className="auth-error">⚠ {error}</div>}
      <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
        Enter the 6-digit code sent to your email
      </p>
      <div className="otp-container" onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputs.current[idx] = el)}
            id={`otp-${idx}`}
            type="text"
            inputMode="numeric"
            className="otp-input"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            autoFocus={idx === 0}
          />
        ))}
      </div>
      <button
        id="otp-verify-btn"
        className="btn btn-primary btn-lg w-full"
        onClick={handleVerify}
        disabled={loading}
      >
        {loading ? <><span className="spinner" />Verifying...</> : 'Verify & Continue →'}
      </button>
      <div className="auth-footer">
        Didn't receive it?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); handleResend(); }}>Resend OTP</a>
      </div>
    </div>
  );
};

// ── Register Form ─────────────────────────────────────────
const RegisterForm = ({ onSwitch }) => {
  const dispatch = useDispatch();
  const { loading, error, registerStep } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerUser(form));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Account created! Check your email for OTP');
    }
  };

  if (registerStep === 'otp') return <OTPForm />;

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">⚠ {error}</div>}
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          id="register-name"
          type="text"
          className="form-input"
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email address</label>
        <input
          id="register-email"
          type="email"
          className="form-input"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          id="register-password"
          type="password"
          className="form-input"
          placeholder="Create a strong password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
        />
      </div>
      <button id="register-submit" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
        {loading ? <><span className="spinner" />Creating account...</> : 'Create Account →'}
      </button>
      <div className="auth-footer">
        Already have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitch(); }}>
          Sign in
        </a>
      </div>
    </form>
  );
};

// ── Main Auth Page ────────────────────────────────────────
export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const dispatch = useDispatch();

  const toggle = () => {
    dispatch(clearError());
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📋</div>
          <h1>Prosk<span>Manager</span></h1>
        </div>
        <div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to manage your projects and tasks'
              : 'Start organizing your work with Prosk Manager'}
          </p>
        </div>
        {mode === 'login' ? <LoginForm onSwitch={toggle} /> : <RegisterForm onSwitch={toggle} />}
      </div>
    </div>
  );
}
