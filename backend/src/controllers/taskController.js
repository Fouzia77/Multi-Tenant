const { Op } = require('sequelize');
const { Task, Project, User, AuditLog } = require('../models');

// POST /api/projects/:projectId/tasks
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;

    const project = await Project.findOne({
      where: { id: projectId, tenantId: req.user.tenantId },
    });
    if (!project) {
      return res
        .status(403)
        .json({ success: false, message: 'Project does not belong to your tenant' });
    }

    // Validate assignee belongs to same tenant (if provided)
    let assigneeId = null;
    if (assignedTo) {
      const assignee = await User.findOne({
        where: { id: assignedTo, tenantId: req.user.tenantId },
      });
      if (!assignee) {
        return res
          .status(400)
          .json({ success: false, message: 'Assigned user must belong to the same tenant' });
      }
      assigneeId = assignee.id;
    }

    const task = await Task.create({
      title,
      description,
      status: 'todo',
      priority,
      projectId,
      tenantId: project.tenantId,
      assignedTo: assigneeId,
      dueDate: dueDate || null,
    });

    await AuditLog.create({
      action: 'CREATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      tenantId: project.tenantId,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/projects/:projectId/tasks
exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;

    const project = await Project.findOne({
      where: { id: projectId, tenantId: req.user.tenantId },
    });
    if (!project) {
      return res
        .status(403)
        .json({ success: false, message: 'Project does not belong to your tenant' });
    }

    const whereClause = {
      tenantId: req.user.tenantId,
      projectId,
    };
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assignedTo) whereClause.assignedTo = assignedTo;
    if (search) {
      whereClause.title = { [Op.iLike]: `%${search}%` };
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { rows, count } = await Task.findAndCountAll({
      where: whereClause,
      order: [
        ['priority', 'DESC'],
        ['dueDate', 'ASC'],
      ],
      limit: parseInt(limit, 10),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        tasks: rows,
        total: count,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit, 10),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/tasks/:taskId/status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findOne({
      where: { id: taskId, tenantId: req.user.tenantId },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    await AuditLog.create({
      action: 'UPDATE_TASK_STATUS',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id,
      details: { status },
    });

    res.status(200).json({ success: true, data: { id: task.id, status: task.status, updatedAt: task.updatedAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/tasks/:taskId
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const task = await Task.findOne({
      where: { id: taskId, tenantId: req.user.tenantId },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    let assigneeId = task.assignedTo;
    if (assignedTo !== undefined) {
      if (assignedTo === null) {
        assigneeId = null;
      } else {
        const assignee = await User.findOne({
          where: { id: assignedTo, tenantId: req.user.tenantId },
        });
        if (!assignee) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user must belong to the same tenant',
          });
        }
        assigneeId = assignee.id;
      }
    }

    await task.update({
      title: title ?? task.title,
      description: description ?? task.description,
      status: status ?? task.status,
      priority: priority ?? task.priority,
      assignedTo: assigneeId,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
    });

    await AuditLog.create({
      action: 'UPDATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/tasks/:taskId
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      where: { id: taskId, tenantId: req.user.tenantId },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.destroy();

    await AuditLog.create({
      action: 'DELETE_TASK',
      entityType: 'Task',
      entityId: taskId,
      tenantId: req.user.tenantId,
      userId: req.user.id,
    });

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};