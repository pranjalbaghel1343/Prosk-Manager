import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ── Async Thunks ──────────────────────────────────────────────────

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/verify-otp', data);
    if (res.data.token) {
      localStorage.setItem('prosk_token', res.data.token);
      localStorage.setItem('prosk_user', JSON.stringify(res.data.user));
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('prosk_token', res.data.token);
      localStorage.setItem('prosk_user', JSON.stringify(res.data.user));
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const resendOTP = createAsyncThunk('auth/resendOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/resend-otp', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

// ── Slice ─────────────────────────────────────────────────────────

const storedUser = localStorage.getItem('prosk_user');
const storedToken = localStorage.getItem('prosk_token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
    pendingUserId: null,
    registerStep: 'form', // 'form' | 'otp'
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.pendingUserId = null;
      state.registerStep = 'form';
      localStorage.removeItem('prosk_token');
      localStorage.removeItem('prosk_user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.pendingUserId = action.payload.userId;
      state.registerStep = 'otp';
    });
    builder.addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Verify OTP
    builder.addCase(verifyOTP.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(verifyOTP.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.registerStep = 'form';
      state.pendingUserId = null;
    });
    builder.addCase(verifyOTP.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Login
    builder.addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Resend OTP
    builder.addCase(resendOTP.fulfilled, (state, action) => {
      state.pendingUserId = action.payload.userId;
    });

    // Fetch me
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
