# System Architecture: ICS - IT Central Support

## 1. System Overview

ICS (IT Central Support) is an internal IT Service Management (ITSM) and Asset Management web application built for an enterprise financial-services operational context. It models realistic workflows for incident tracking, hardware asset lifecycle, role-based authorization, and administrative audit logging.

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|  (React 18 + Vite SPA, Responsive Dark/Light Theme Engine)  |
+------------------------------+------------------------------+
                               |
                        HTTP / JSON (REST)
                               |
+------------------------------v------------------------------+
|                   Flask 3.0 Application                      |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  Static SPA Serving & Client Routing Fallback         |  |
|  +-------------------------------------------------------+  |
|  |  Reverse Proxy Support (Werkzeug ProxyFix)            |  |
|  +-------------------------------------------------------+  |
|  |  Session Authentication & Role Middleware             |  |
|  |  (EMPLOYEE, IT_SUPPORT, IT_MANAGER)                   |  |
|  +-------------------------------------------------------+  |
|  |  REST API Blueprints:                                 |  |
|  |  • /api/auth       • /api/tickets    • /api/assets    |  |
|  |  • /api/dashboard  • /api/users      • /api/audit     |  |
|  |  • /api/departments                                  |  |
|  +-------------------------------------------------------+  |
|  |  SQLAlchemy 2.0 ORM & Business Logic Services        |  |
|  +-------------------------------------------------------+  |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|                     Relational Storage                      |
|         (SQLite local/container or PostgreSQL cloud)        |
+-------------------------------------------------------------+
```

---

## 2. Core Architectural Principles

1. **Server Authority & Zero Trust**:
   - The backend enforces all business rules, field validations, role checks, and state transitions.
   - Client-side validation exists purely for user feedback; bypass attempts are strictly rejected with appropriate HTTP status codes (`400`, `401`, `403`, `404`, `409`).
2. **Unified Single-Service Deployment**:
   - In production, Flask serves the compiled static React SPA (`frontend/dist`) while routing API requests under `/api/*`. This eliminates cross-origin resource sharing (CORS) complexity and ensures cookie-based sessions work natively on any domain.
3. **Role-Based Access Control (RBAC)**:
   - Three hierarchical roles are strictly enforced:
     - **`EMPLOYEE`**: Can create tickets, view own tickets, add comments, view assigned hardware assets.
     - **`IT_SUPPORT`**: Can view all tickets and assets, change operational status, assign technicians, resolve incidents with resolution notes, register and update hardware assets.
     - **`IT_MANAGER`**: All IT Support privileges plus user management (activating/deactivating accounts, promoting roles with last-manager safety guard) and immutable audit log reviews.
4. **Audit Trail & Observability**:
   - High-impact operational events (ticket status changes, asset reassignments, user modifications) are recorded in an immutable `AuditLog` table with actor ID, entity ID, action type, and JSON details.

---

## 3. Security Architecture

- **Password Storage**: Passwords hashed using PBKDF2/scrypt through `werkzeug.security`. Passwords are never returned in API payloads (`include_password=False` by default).
- **Session Security**:
  - `HttpOnly`: Protects session cookies from malicious client-side JavaScript access.
  - `SameSite=Lax`: Defends against Cross-Site Request Forgery (CSRF).
  - `Secure`: Transmitted only over HTTPS in production environments.
  - `ProxyFix`: Accurately preserves forwarded protocol headers (`X-Forwarded-Proto`) when hosted behind reverse proxies such as Nginx or Render.
