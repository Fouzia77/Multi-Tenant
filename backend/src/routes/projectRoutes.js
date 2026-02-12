const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Project CRUD
router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Nested task routes per spec: /api/projects/:projectId/tasks
router.post('/:projectId/tasks', taskController.createTask);
router.get('/:projectId/tasks', taskController.getProjectTasks);

module.exports = router;