require('dotenv').config();

// In Docker, backend runs on port 5000 inside the same container, so localhost is fine.
const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:5000/api';

async function http(method, path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${res.statusText} :: ${text}`);
  }
  return json;
}

async function run() {
  try {
    console.log('🔍 SMOKE TEST: /api/health');
    const health = await http('GET', '/health');
    console.log('  ✔ health:', health);

    console.log('\n🔐 SMOKE TEST: super admin login');
    const superLogin = await http('POST', '/auth/login', {
      email: 'superadmin@system.com',
      password: 'Admin@123',
    });
    const superToken = superLogin.data.token;
    console.log('  ✔ super admin logged in as', superLogin.data.user);

    console.log('\n🔐 SMOKE TEST: tenant admin login');
    const tenantLogin = await http('POST', '/auth/login', {
      email: 'admin@demo.com',
      password: 'Demo@123',
      tenantSubdomain: 'demo',
    });
    const tenantToken = tenantLogin.data.token;
    const tenantId = tenantLogin.data.user.tenantId;
    console.log('  ✔ tenant admin logged in for tenant', tenantId);

    console.log('\n🏢 SMOKE TEST: list tenants (super admin)');
    const tenants = await http('GET', '/tenants?page=1&limit=10', null, superToken);
    console.log('  ✔ tenants count:', tenants.data.tenants.length);

    console.log('\n👥 SMOKE TEST: list tenant users (tenant admin)');
    const usersRes = await http('GET', `/tenants/${tenantId}/users`, null, tenantToken);
    console.log('  ✔ users in tenant:', usersRes.data.users.length);

    console.log('\n📁 SMOKE TEST: list projects (tenant admin)');
    const projectsRes = await http('GET', '/projects', null, tenantToken);
    const projects = projectsRes.data.projects || projectsRes.data;
    console.log('  ✔ projects:', projects.length);
    const firstProjectId = projects[0]?.id;

    if (firstProjectId) {
      console.log(`\n✅ SMOKE TEST: list tasks for project ${firstProjectId}`);
      const tasksRes = await http('GET', `/projects/${firstProjectId}/tasks`, null, tenantToken);
      const tasks = tasksRes.data.tasks || tasksRes.data;
      console.log('  ✔ tasks for project:', tasks.length);
    }

    console.log('\n🎉 SMOKE TESTS COMPLETED SUCCESSFULLY');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ SMOKE TEST FAILED');
    console.error(err.message || err);
    process.exit(1);
  }
}

run();

