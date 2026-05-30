const express = require('express');
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/auth');
const {
  createTask,
  getTasks,
  updateTask,
  toggleTask,
  deleteTask,
} = require('../controllers/taskController');

router.use(authMiddleware);

router.route('/').post(createTask).get(getTasks);
router.route('/:taskId').put(updateTask).delete(deleteTask);
router.patch('/:taskId/toggle', toggleTask);

module.exports = router;
