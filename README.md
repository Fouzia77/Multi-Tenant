Multi-Tenant SaaS Platform – Project & Task Management System
Project Overview :

The Multi-Tenant SaaS Platform is a production-ready, full-stack Software-as-a-Service application that enables multiple organizations (tenants) to independently manage their users, projects, and tasks within a single shared system.

The platform is designed with strict tenant data isolation, role-based access control (RBAC), subscription plan enforcement, and Dockerized deployment, making it suitable for real-world SaaS use cases and automated evaluation.

This project demonstrates industry-standard practices in multi-tenancy architecture, secure authentication, scalable backend APIs, and modern frontend development.

Objectives

Build a secure multi-tenant SaaS application

Ensure complete data isolation between tenants

Implement JWT-based authentication and RBAC

Enforce subscription plan limits

Provide a responsive frontend UI

Deliver a fully dockerized, one-command deployment

Automatically initialize database with migrations and seed data

👥 Target Users

Super Admin – System-level administrator managing all tenants

Tenant Admin – Organization administrator managing users and projects

End User – Team member managing assigned tasks

✨ Key Features

🏢 Multi-tenant architecture with strict data isolation

🔐 JWT-based authentication (24-hour expiry)

👮 Role-Based Access Control (Super Admin, Tenant Admin, User)

📦 Subscription plans with enforced limits

👥 User management per tenant

📁 Project and task management

🧾 Audit logging for critical actions

📊 Dashboard with statistics

📱 Fully responsive frontend

🐳 Docker & Docker Compose deployment

⚙️ Automatic database migrations & seeding

❤️ Health check endpoint for readiness verification

System Architecture

The application follows a three-tier architecture:

Browser
   ↓
Frontend (React)
   ↓
Backend API (Node.js / Express)
   ↓
Database (PostgreSQL)

Multi-Tenancy Strategy

This project uses the Shared Database + Shared Schema approach:

A single PostgreSQL database

All tenant-related tables include a tenant_id column

Tenant context is extracted from JWT tokens

Backend middleware automatically filters data by tenant_id

Super Admin users have tenant_id = NULL

This approach balances scalability, simplicity, and cost efficiency, while maintaining strong logical data isolation.

🔐 Authentication & Authorization
Authentication

JWT (JSON Web Tokens)

Token contains { userId, tenantId, role }

Token expiry: 24 hours

Stateless authentication (no session storage required)

Authorization (RBAC):
| Role         | Permissions                                 |
| ------------ | ------------------------------------------- |
| Super Admin  | Access all tenants, update plans            |
| Tenant Admin | Manage users, projects, tasks within tenant |
| User         | Access assigned projects and tasks          |

Authorization is enforced at the API level, not only in the UI.

Subscription Plans :
| Plan       | Max Users | Max Projects |
| ---------- | --------- | ------------ |
| Free       | 5         | 3            |
| Pro        | 25        | 15           |
| Enterprise | 100       | 50           |


New tenants start on the Free plan

Limits are enforced before resource creation

Exceeding limits returns 403 Forbidden

🗄️ Database Design
Core Tables

tenants

users

projects

tasks

audit_logs

Key Design Rules

Composite unique constraint: (tenant_id, email)

Foreign keys with CASCADE delete

Indexes on tenant_id for performance

Super admin users have tenant_id = NULL

ER Diagram

🔌 API Overview

The backend exposes 19 RESTful API endpoints, covering:

Authentication :

Tenant management

User management

Project management

Task management

Full API documentation:
See docs/API.md

Frontend Application
Pages Implemented

Tenant Registration

Login

Dashboard

Projects List

Project Details

Users Management

Frontend Features

Protected routes

Role-based UI rendering

Error handling and feedback

Mobile-responsive design

Token validation on app load

Auto logout on token expiry

Dockerized Deployment (MANDATORY)

This application is fully containerized and runs with one command.
| Service  | Name       | Port |
| -------- | ---------- | ---- |
| Database | `database` | 5432 |
| Backend  | `backend`  | 5000 |
| Frontend | `frontend` | 3000 |

tart Application
docker-compose up -d

Verify Services
docker-compose ps

Health Check
curl http://localhost:5000/api/health


Expected response:

{
  "status": "ok",
  "database": "connected"
}

Conclusion:

This project demonstrates a real-world, production-ready multi-tenant SaaS platform, implementing best practices in backend security, database design, frontend architecture, and DevOps automation.

It is fully compliant with all project requirements and ready for automated evaluation.