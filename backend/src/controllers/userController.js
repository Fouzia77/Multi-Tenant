const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Tenant, AuditLog } = require('../models');

// POST /api/tenants/:tenantId/users
exports.createUser = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Only tenant admins can add users' });
    }

    if (req.user.tenantId !== tenantId) {
      return res.status(403).json({ success: false, message: 'Cannot add users to another tenant' });
    }

    const tenant = await Tenant.findByPk(tenantId);
    const currentUserCount = await User.count({ where: { tenantId } });

    if (currentUserCount >= tenant.maxUsers) {
      return res.status(403).json({
        success: false,
        message: `User limit reached for plan (${tenant.maxUsers} max)`,
      });
    }

    const { fullName, email, password, role } = req.body;

    const userExists = await User.findOne({ where: { email, tenantId } });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'User already exists in this tenant' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'user',
      tenantId,
    });

    await AuditLog.create({
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      tenantId,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tenants/:tenantId/users
exports.listUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { search, role, page = 1, limit = 50 } = req.query;

    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const where = { tenantId };

    if (role) {
      where.role = role;
    }

    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        users: rows,
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

exports.updateUser = async (req, res) => {
  try {
    const { fullName, role, isActive } = req.body;
    const user = await User.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId }});
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if ((role || typeof isActive === 'boolean') && req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to change role' });
    }

    await user.update({
      fullName: fullName ?? user.fullName,
      role: role ?? user.role,
      isActive: typeof isActive === 'boolean' ? isActive : user.isActive,
    });

    await AuditLog.create({
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: user.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // --- MANDATORY FIX: Prevent self-deletion ---
    if (req.params.id === req.user.id) {
        return res.status(403).json({ success: false, message: 'Cannot delete yourself' });
    }
    // --------------------------------------------

    const userToDelete = await User.findOne({ 
      where: { id: req.params.id, tenantId: req.user.tenantId } 
    });

    if (!userToDelete) return res.status(404).json({ success: false, message: 'User not found' });

    await userToDelete.destroy();

    await AuditLog.create({
      action: 'DELETE_USER',
      entityType: 'User',
      entityId: req.params.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, message: 'User removed from team' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};