const pool = require('../config/db');

// ─────────────────────────────────────────────
//  CREATE TASK
// ─────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const { title, description, priority, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, project_id, user_id, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description || '', projectId, userId, priority || 'medium', due_date || null]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  GET ALL TASKS FOR A PROJECT
// ─────────────────────────────────────────────
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const { status, priority, search } = req.query;

    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    let query = 'SELECT * FROM tasks WHERE project_id = $1 AND user_id = $2';
    const params = [projectId, userId];
    let paramIdx = 3;

    if (status) {
      query += ` AND status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (priority) {
      query += ` AND priority = $${paramIdx}`;
      params.push(priority);
      paramIdx++;
    }

    if (search) {
      query += ` AND title ILIKE $${paramIdx}`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, created_at DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      tasks: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  UPDATE TASK
// ─────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.userId;
    const { title, description, status, priority, due_date } = req.body;

    const existing = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND project_id = $2 AND user_id = $3',
      [taskId, projectId, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date)
       WHERE id = $6
       RETURNING *`,
      [title, description, status, priority, due_date, taskId]
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully!',
      task: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  TOGGLE TASK STATUS
// ─────────────────────────────────────────────
const toggleTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.userId;

    const existing = await pool.query(
      'SELECT id, status FROM tasks WHERE id = $1 AND project_id = $2 AND user_id = $3',
      [taskId, projectId, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const currentStatus = existing.rows[0].status;
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [newStatus, taskId]
    );

    res.status(200).json({
      success: true,
      message: `Task marked as ${newStatus}!`,
      task: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  DELETE TASK
// ─────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND project_id = $2 AND user_id = $3 RETURNING id',
      [taskId, projectId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.status(200).json({ success: true, message: 'Task deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, updateTask, toggleTask, deleteTask };
