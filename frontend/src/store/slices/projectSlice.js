import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ── Async Thunks ─────────────────────────────────────────

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/projects', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/projects', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
  }
});

// ── Slice ─────────────────────────────────────────────────

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    currentProject: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProject(state) { state.currentProject = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchProjects.fulfilled, (s, a) => {
      s.loading = false;
      s.list = a.payload.projects;
      s.pagination = a.payload.pagination;
    });
    builder.addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

    builder.addCase(fetchProject.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchProject.fulfilled, (s, a) => {
      s.loading = false;
      s.currentProject = a.payload.project;
    });
    builder.addCase(fetchProject.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

    builder.addCase(createProject.fulfilled, (s, a) => {
      s.list.unshift(a.payload.project);
    });

    builder.addCase(updateProject.fulfilled, (s, a) => {
      const idx = s.list.findIndex((p) => p.id === a.payload.project.id);
      if (idx !== -1) s.list[idx] = a.payload.project;
      if (s.currentProject?.id === a.payload.project.id) s.currentProject = a.payload.project;
    });

    builder.addCase(deleteProject.fulfilled, (s, a) => {
      s.list = s.list.filter((p) => p.id !== a.payload);
      if (s.currentProject?.id === a.payload) s.currentProject = null;
    });
  },
});

export const { clearCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
