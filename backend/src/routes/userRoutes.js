const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Note: spec uses /api/tenants/:tenantId/users; router is mounted at /api/users,
// so these routes are primarily used by the frontend for convenience.
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;