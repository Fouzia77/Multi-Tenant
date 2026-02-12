const { Tenant, User, Project, Task, AuditLog } = require('../models');

exports.getTenant = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin' && req.user.tenantId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const [totalUsers, totalProjects, totalTasks] = await Promise.all([
      User.count({ where: { tenantId: tenant.id } }),
      Project.count({ where: { tenantId: tenant.id } }),
      Task.count({ where: { tenantId: tenant.id } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscriptionPlan,
        maxUsers: tenant.maxUsers,
        maxProjects: tenant.maxProjects,
        createdAt: tenant.createdAt,
        stats: {
          totalUsers,
          totalProjects,
          totalTasks,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listTenants = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // --- MANDATORY FIX: Pagination Implementation ---
    const { page = 1, limit = 10, status, subscriptionPlan } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter object
    const whereClause = {};
    if (status) whereClause.status = status;
    if (subscriptionPlan) whereClause.subscriptionPlan = subscriptionPlan;

    const { count, rows } = await Tenant.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    // attach basic stats per tenant
    const tenantsWithStats = await Promise.all(
      rows.map(async (t) => {
        const [totalUsers, totalProjects] = await Promise.all([
          User.count({ where: { tenantId: t.id } }),
          Project.count({ where: { tenantId: t.id } }),
        ]);
        return {
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionPlan: t.subscriptionPlan,
          totalUsers,
          totalProjects,
          createdAt: t.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        tenants: tenantsWithStats,
        pagination: {
          totalTenants: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit),
        },
      },
    });
    // ------------------------------------------------
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    if (req.user.role === 'tenant_admin') {
      if (req.user.tenantId !== req.params.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
      await tenant.update({ name });
    } else if (req.user.role === 'super_admin') {
      await tenant.update({ name, status, subscriptionPlan, maxUsers, maxProjects });
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await AuditLog.create({
      action: 'UPDATE_TENANT',
      entityType: 'Tenant',
      entityId: tenant.id,
      tenantId: tenant.id,
      userId: req.user.id,
      details: req.body
    });

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};