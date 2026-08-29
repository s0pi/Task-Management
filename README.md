# TaskFlow Multi-Tenant Task Management Frontend

TaskFlow is a multi-tenant task management dashboard built with React + Vite. The frontend is designed to support multiple companies or tenants with role-based access for administrators, super administrators, and staff members.

This repository contains the front-end user interface and interaction flow. It is intentionally structured so that backend integration can be connected later without changing the user-facing architecture.

## Project Overview

The application provides:

- Multi-tenant dashboard structure
- Role-based access control simulation for frontend behavior
- Task creation, listing, and completion workflows
- Team member management
- Tenant visibility and isolation logic
- AI assistant panel integration pattern
- Secure login and logout flow for different user roles

## User Roles and Permissions

- Super Admin: Full access across all tenants. Can manage users, tasks, and tenant-level configuration.
- Admin: Tenant-scoped access. Can manage members and tasks inside their assigned tenant only.
- Staff: Restricted access. Can only view and update tasks assigned to them.

## Project Setup Instructions

### Prerequisites

Before running the project, ensure the following are installed:

- Node.js 18 or newer
- npm or pnpm
- Git

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev -- --host
```

The development server will start and provide a local URL such as:

```bash
http://localhost:5173
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview -- --host
```

## Environment Variable Setup

This project is front-end only and does not require a production database connection in the current repository. However, the app is prepared for API integration and can be configured using environment variables.

Create a file named `.env.local` in the project root and add values similar to the following:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AI_API_URL=http://localhost:8080/api/ai
VITE_KEYCLOAK_URL=http://localhost:8080/auth
VITE_KEYCLOAK_REALM=taskflow
VITE_KEYCLOAK_CLIENT_ID=taskflow-frontend
```

### Notes

- `VITE_API_BASE_URL` is used for backend endpoints.
- `VITE_AI_API_URL` is expected for AI assistant integration.
- `VITE_KEYCLOAK_*` variables are used for authentication integration when Keycloak is connected to the frontend.
- If you are running the frontend only, the app still works in a mock/demo mode with local state behavior.

## Database Setup (PostgreSQL)

The system is designed for a multi-tenant PostgreSQL architecture. The database layer is expected to be implemented by the backend service, but the frontend assumes the following structure and responsibilities.

### Recommended PostgreSQL Setup

1. Install PostgreSQL 14+.
2. Create a database named `taskflow`.
3. Create a dedicated role/user for application access.
4. Configure connection details in the backend environment.

Example SQL:

```sql
CREATE DATABASE taskflow;
CREATE USER taskflow_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE taskflow TO taskflow_user;
```

### Recommended Tables

The backend database should include tables such as:

- users
- roles
- tenants
- tenant_members
- tasks
- task_assignments
- activity_logs

### Suggested Relationship Model

- One tenant can have many users.
- One user can belong to one or more roles.
- One tenant can contain many tasks.
- Tasks are assigned to users and scoped to tenant access rules.

### Data Isolation Rule

The system should enforce strict tenant isolation:

- Admins can only access data from their own tenant.
- Super Admins can access all tenants.
- Staff members should only access tasks assigned to them within the same tenant.

## Keycloak Configuration

Keycloak is intended for centralized identity and access management for this architecture.

### Recommended Keycloak Setup

1. Install and run Keycloak.
2. Create a new realm named `taskflow`.
3. Create a client for the frontend application.
4. Configure the role mappings:
   - `super-admin`
   - `admin`
   - `staff`
5. Assign the appropriate roles to users.

### Example Realm and Client Setup

- Realm: `taskflow`
- Client ID: `taskflow-frontend`
- Client Type: Public or confidential depending on the backend authentication flow
- Redirect URI:

```text
http://localhost:5173/*
```

### Role Mapping Example

- `super-admin`: Full cross-tenant access
- `admin`: Tenant-specific administration access
- `staff`: Limited task access

### Frontend Integration Notes

The frontend expects the following authentication context to be available from Keycloak or the backend:

- user name
- role
- tenant id
- email

The current repository contains the role-based UI logic for this behavior but does not include a true backend SSO integration in the codebase.

## Architecture Overview

The system follows a modular front-end architecture with separation between presentation logic and tenant-aware role logic.

### Frontend Architecture

- React application initialized through Vite
- Component-driven UI layout
- State-driven workflow for tasks, users, and tenants
- Role-aware rendering logic
- Tenant filtering applied at the UI layer
- API-ready integration points for future backend services

### Multi-Tenant Flow

1. A user signs in.
2. The system resolves their role and tenant.
3. The app filters the workspace content based on the active tenant.
4. The UI adjusts available actions depending on permissions.
5. Task and team management remain scoped to authorized access.

### Current Frontend State

The app currently includes:

- login and logout flows
- mock role switching behavior
- tenant-based dashboard behavior
- admin-only management actions
- staff restrictions
- AI assistant interface placeholder

This repository is intentionally front-end-focused, and backend integrations are expected to be added separately.

## Assumptions and Notes

- This repository is a front-end implementation only.
- No backend API, database provider, or production authentication service is included in this project by default.
- The UI currently uses local state and mock data to demonstrate multi-tenant behavior and permission flows.
- PostgreSQL and Keycloak setup are documented as part of the intended full system architecture.
- The AI assistant panel is included as a UI integration point and expects a backend endpoint such as `/api/ai/chat`.
- The application is suitable for demonstration, prototype review, and extension into a full production-ready platform.

## Project Structure

```text
src/
  App.jsx
  index.css
  main.jsx
public/
  ...
package.json
vite.config.js
README.md
```

## Summary

This project demonstrates a multi-tenant task management interface with role-based permissions and a realistic administrator workflow. It is structured to align with a larger enterprise architecture that includes PostgreSQL for persistence and Keycloak for identity and role management.

## Contact / Notes for Reviewers

This repository is meant to provide the frontend foundation for a larger system. For full production deployment, the following should be added externally:

- backend API service
- PostgreSQL database integration
- Keycloak authentication setup
- real tenant and role enforcement in the server layer

