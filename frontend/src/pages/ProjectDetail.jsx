import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProject } from '../store/slices/projectSlice';
import {
  fetchTasks, createTask, updateTask, toggleTask, deleteTask
} from '../store/slices/taskSlice';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

// ── Task Modal ─────────────────────────────────────────────
const TaskModal = ({ task, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    status: task?.status || 'pending',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, due_date: form.due_date || null });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? '✏️ Edit Task' : '➕ New Task'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              id="task-title-input"
              type="text"
              className="form-input"
              placeholder="e.g. Design login screen"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="task-desc-input"
              className="form-input"
              placeholder="Task details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                id="task-priority-select"
                className="form-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                id="task-due-input"
                type="date"
                className="form-input"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          {task && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                id="task-status-select"
                className="form-input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">⏳ Pending</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="task-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" />Saving...</> : task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Priority Badge ────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const config = {
    high: { label: '🔴 High', cls: 'badge-danger' },
    medium: { label: '🟡 Medium', cls: 'badge-warning' },
    low: { label: '🟢 Low', cls: 'badge-success' },
  };
  const c = config[priority] || config.medium;
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
};

// ── Task Item ─────────────────────────────────────────────
const TaskItem = ({ task, projectId, onEdit }) => {
  const dispatch = useDispatch();
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleToggle = async () => {
    const res = await dispatch(toggleTask({ projectId, taskId: task.id }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(res.payload.task.status === 'completed' ? '✅ Task completed!' : '↩️ Marked incomplete');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    await dispatch(deleteTask({ projectId, taskId: task.id }));
    toast.success('Task deleted');
  };

  return (
    <div className={`task-item ${task.status === 'completed' ? 'completed' : ''}`} id={`task-${task.id}`}>
      <div
        className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
        onClick={handleToggle}
        role="checkbox"
        aria-checked={task.status === 'completed'}
        title="Toggle task status"
      >
        {task.status === 'completed' && <span style={{ color: 'white', fontSize: 13 }}>✓</span>}
      </div>

      <div className="task-content">
        <div className={`task-title ${task.status === 'completed' ? 'done' : ''}`}>
          {task.title}
        </div>
        <div className="task-meta">
          <PriorityBadge priority={task.priority} />
          {task.status === 'in_progress' && (
            <span className="badge badge-purple">🔄 In Progress</span>
          )}
          {task.due_date && (
            <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
              📅 {isOverdue ? '⚠ Overdue · ' : ''}{new Date(task.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button
          id={`edit-task-${task.id}`}
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => onEdit(task)}
          title="Edit task"
        >✏️</button>
        <button
          id={`delete-task-${task.id}`}
          className="btn btn-danger btn-icon btn-sm"
          onClick={handleDelete}
          title="Delete task"
        >🗑️</button>
      </div>
    </div>
  );
};

// ── Project Detail Page ───────────────────────────────────
export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, loading: projLoading } = useSelector((s) => s.projects);
  const { list: tasks, loading: taskLoading } = useSelector((s) => s.tasks);
  const [modal, setModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProject(projectId));
    dispatch(fetchTasks({ projectId }));
  }, [dispatch, projectId]);

  const handleCreate = async (form) => {
    const res = await dispatch(createTask({ projectId, data: form }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Task added!');
      setModal(null);
    } else toast.error(res.payload);
  };

  const handleEdit = async (form) => {
    const res = await dispatch(updateTask({ projectId, taskId: modal.task.id, data: form }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Task updated!');
      setModal(null);
    } else toast.error(res.payload);
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const done = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  if (projLoading) return (
    <>
      <Navbar />
      <div className="loading-screen" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <span className="spinner spinner-lg" />
        <p>Loading project...</p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="page-content animate-fade-in">
        {/* Back */}
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="project-detail-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>{currentProject?.title}</h1>
              <span className={`badge badge-${currentProject?.status === 'active' ? 'purple' : currentProject?.status === 'completed' ? 'success' : 'muted'}`}>
                {currentProject?.status}
              </span>
            </div>
            {currentProject?.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{currentProject.description}</p>
            )}
          </div>
          <button
            id="add-task-btn"
            className="btn btn-primary"
            onClick={() => setModal({ mode: 'create' })}
          >
            ➕ Add Task
          </button>
        </div>

        {/* Progress */}
        {tasks.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>Overall Progress</span>
              <span style={{ color: 'var(--accent-light)', fontWeight: 700 }}>{progress}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>⏳ Pending: <strong style={{ color: 'var(--text-primary)' }}>{pending}</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>🔄 In Progress: <strong style={{ color: 'var(--accent-light)' }}>{inProgress}</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>✅ Done: <strong style={{ color: 'var(--success)' }}>{done}</strong></span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <div className="search-input-wrap" style={{ flex: 1 }}>
            <span className="icon">🔍</span>
            <input
              id="task-search"
              type="text"
              className="form-input"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="task-filters">
          {['all', 'pending', 'in_progress', 'completed'].map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', height: 24, alignSelf: 'center' }} />
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              className={`filter-btn ${priorityFilter === p ? 'active' : ''}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}{p !== 'all' && ' Priority'}
            </button>
          ))}
        </div>

        {/* Task List */}
        {taskLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <span className="spinner spinner-lg" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>{tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}</h3>
            <p>{tasks.length === 0 ? 'Add your first task to this project' : 'Try adjusting your filters'}</p>
            {tasks.length === 0 && (
              <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
                ➕ Add First Task
              </button>
            )}
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projectId={projectId}
                onEdit={(t) => setModal({ mode: 'edit', task: t })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <TaskModal
          task={modal.mode === 'edit' ? modal.task : null}
          onClose={() => setModal(null)}
          onSave={modal.mode === 'edit' ? handleEdit : handleCreate}
        />
      )}
    </>
  );
}
