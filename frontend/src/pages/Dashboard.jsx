import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../store/slices/projectSlice';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

// ── Project Modal ─────────────────────────────────────────
const ProjectModal = ({ project, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'active',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? '✏️ Edit Project' : '✨ New Project'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              id="project-title-input"
              type="text"
              className="form-input"
              placeholder="e.g. Mobile App Redesign"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="project-desc-input"
              className="form-input"
              placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          {project && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                id="project-status-select"
                className="form-input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">🟢 Active</option>
                <option value="completed">✅ Completed</option>
                <option value="archived">📦 Archived</option>
              </select>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="project-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" />Saving...</> : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20' }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div>
      <div className="stat-number" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

// ── Project Card ──────────────────────────────────────────
const ProjectCard = ({ project, onClick, onEdit, onDelete }) => {
  const totalTasks = parseInt(project.total_tasks) || 0;
  const completedTasks = parseInt(project.completed_tasks) || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusColor = {
    active: 'var(--accent-light)',
    completed: 'var(--success)',
    archived: 'var(--text-muted)',
  }[project.status] || 'var(--accent-light)';

  return (
    <div
      className="project-card"
      id={`project-card-${project.id}`}
      onClick={() => onClick(project.id)}
    >
      <div className="project-card-header">
        <span className={`badge badge-${project.status === 'active' ? 'purple' : project.status === 'completed' ? 'success' : 'muted'}`}>
          {project.status}
        </span>
        <div className="project-actions" onClick={(e) => e.stopPropagation()}>
          <button
            id={`edit-project-${project.id}`}
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => onEdit(project)}
            title="Edit project"
          >✏️</button>
          <button
            id={`delete-project-${project.id}`}
            className="btn btn-danger btn-icon btn-sm"
            onClick={() => onDelete(project.id)}
            title="Delete project"
          >🗑️</button>
        </div>
      </div>

      <h3 className="project-card-title">{project.title}</h3>
      <p className="project-card-desc">{project.description || 'No description provided.'}</p>

      {totalTasks > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="project-card-footer">
        <span className="project-task-count">
          📌 {totalTasks} task{totalTasks !== 1 ? 's' : ''}
          {completedTasks > 0 && ` · ✓ ${completedTasks} done`}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date(project.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

// ── Dashboard Page ─────────────────────────────────────────
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { list: projects, loading, pagination } = useSelector((s) => s.projects);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchProjects({ search, status: statusFilter }));
  }, [dispatch, search, statusFilter]);

  const handleCreate = async (form) => {
    const res = await dispatch(createProject(form));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Project created! 🎉');
      setModal(null);
    } else {
      toast.error(res.payload);
    }
  };

  const handleEdit = async (form) => {
    const res = await dispatch(updateProject({ id: modal.project.id, data: form }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Project updated!');
      setModal(null);
    } else {
      toast.error(res.payload);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    const res = await dispatch(deleteProject(id));
    if (res.meta.requestStatus === 'fulfilled') toast.success('Project deleted');
    else toast.error(res.payload);
  };

  const total = projects.length;
  const active = projects.filter((p) => p.status === 'active').length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const totalTasks = projects.reduce((a, p) => a + (parseInt(p.total_tasks) || 0), 0);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="dashboard-header animate-fade-in">
          <h1 className="dashboard-greeting">
            {greeting}, <span>{firstName}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Here's an overview of your workspace
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid animate-slide-up">
          <StatCard icon="📁" label="Total Projects" value={total} color="#6366f1" />
          <StatCard icon="🚀" label="Active" value={active} color="#818cf8" />
          <StatCard icon="✅" label="Completed" value={completed} color="#10b981" />
          <StatCard icon="📌" label="Total Tasks" value={totalTasks} color="#f59e0b" />
        </div>

        {/* Projects Section */}
        <div className="projects-header">
          <h2>Your Projects</h2>
          <button
            id="create-project-btn"
            className="btn btn-primary"
            onClick={() => setModal({ mode: 'create' })}
          >
            + New Project
          </button>
        </div>

        {/* Search & Filter */}
        <div className="search-bar">
          <div className="search-input-wrap" style={{ flex: 1 }}>
            <span className="icon">🔍</span>
            <input
              id="project-search"
              type="text"
              className="form-input"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
          </div>
          <select
            id="project-status-filter"
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner spinner-lg" />
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>No projects yet</h3>
            <p>{search ? 'No projects match your search' : 'Create your first project to get started'}</p>
            {!search && (
              <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
                ✨ Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={(id) => navigate(`/projects/${id}`)}
                onEdit={(p) => setModal({ mode: 'edit', project: p })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${pagination.page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => dispatch(fetchProjects({ page: i + 1, search, status: statusFilter }))}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ProjectModal
          project={modal.mode === 'edit' ? modal.project : null}
          onClose={() => setModal(null)}
          onSave={modal.mode === 'edit' ? handleEdit : handleCreate}
        />
      )}
    </>
  );
}
