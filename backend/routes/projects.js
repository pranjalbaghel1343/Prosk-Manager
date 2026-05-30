const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

router.use(authMiddleware);

router.route('/').post(createProject).get(getProjects);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

module.exports = router;
