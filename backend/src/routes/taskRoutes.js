const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All routes here are protected
router.use(protect);

// Task status & update endpoints (task-level)
router.patch('/:taskId/status', taskController.updateTaskStatus);
router.put('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;