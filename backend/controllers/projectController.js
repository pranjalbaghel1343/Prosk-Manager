const pool = require('../config/db');

// ─────────────────────────────────────────────
//  CREATE PROJECT
// ─────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    const result = await pool.query(
      `INSERT INTO projects (title, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, status, created_at`,
      [title, description || '', userId]
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      project: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  GET ALL PROJECTS
// ─────────────────────────────────────────────
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        p.*,
        COUNT(t.id) AS total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.user_id = $1
    `;
    const params = [userId];
    let paramIdx = 2;

    if (search) {
      query += ` AND (p.title ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (status) {
      query += ` AND p.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      projects: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  GET SINGLE PROJECT
// ─────────────────────────────────────────────
const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
        p.*,
        COUNT(t.id) AS total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.id = $1 AND p.user_id = $2
       GROUP BY p.id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.status(200).json({ success: true, project: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  UPDATE PROJECT
// ─────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, status } = req.body;

    const existing = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const result = await pool.query(
      `UPDATE projects
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title, description, status, id, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully!',
      project: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  DELETE PROJECT
// ─────────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.status(200).json({ success: true, message: 'Project deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject };
