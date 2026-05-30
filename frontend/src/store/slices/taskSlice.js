import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ── Async Thunks ─────────────────────────────────────────

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async ({ projectId, params = {} }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects/${projectId}/tasks`, { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk('tasks/create', async ({ projectId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/projects/${projectId}/tasks`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ projectId, taskId, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${projectId}/tasks/${taskId}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

export const toggleTask = createAsyncThunk('tasks/toggle', async ({ projectId, taskId }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/projects/${projectId}/tasks/${taskId}/toggle`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle task');
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async ({ projectId, taskId }, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    return taskId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

// ── Slice ─────────────────────────────────────────────────

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTasks(state) { state.list = []; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchTasks.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.tasks; });
    builder.addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

    builder.addCase(createTask.fulfilled, (s, a) => { s.list.unshift(a.payload.task); });

    builder.addCase(updateTask.fulfilled, (s, a) => {
      const idx = s.list.findIndex((t) => t.id === a.payload.task.id);
      if (idx !== -1) s.list[idx] = a.payload.task;
    });

    builder.addCase(toggleTask.fulfilled, (s, a) => {
      const idx = s.list.findIndex((t) => t.id === a.payload.task.id);
      if (idx !== -1) s.list[idx] = a.payload.task;
    });

    builder.addCase(deleteTask.fulfilled, (s, a) => {
      s.list = s.list.filter((t) => t.id !== a.payload);
    });
  },
});

export const { clearTasks, clearError } = taskSlice.actions;
export default taskSlice.reducer;
