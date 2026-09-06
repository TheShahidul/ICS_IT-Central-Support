# ICS - IT Central Support
## Project Instructions: Run, Explore, Understand, and Extend

This guide describes the current project state as of Milestone 3.

The project is a fictional educational portfolio application that simulates internal IT support operations. It is not connected to a real company or production system.

## 1. Current Status

### Working now

- Flask backend application
- SQLite database
- Database schema and relationships
- Seed data with realistic demo records
- Session-based authentication
- Login, logout, and current-user API endpoints
- Authentication and authorization decorators
- Focused pytest suite
- React/Vite project scaffold and route structure

### Remaining scope

- Production database migrations and deployment configuration
- More extensive dashboard charts and reporting
- Additional browser-level tests

The core local development workflow is now runnable end to end: authenticate, view dashboard metrics, create and manage tickets, add comments, and view assets according to role permissions.

## 2. Technology Stack

- Python 3.14+
- Flask 3.0
- Flask-SQLAlchemy 3.1
- SQLAlchemy 2.0
- SQLite
- Werkzeug password hashing
- pytest
- React 18
- Vite 4
- React Router
- Bootstrap
- Axios

The project intentionally does not use TypeScript, Redux, Next.js, Tailwind, Docker, Kubernetes, GraphQL, or microservices.

## 3. Repository Structure

```text
it-support-asset/
├── backend/
│   ├── app/
│   │   ├── middleware/
│   │   │   └── auth_middleware.py
│   │   ├── routes/
│   │   │   └── auth.py
│   │   ├── services/
│   │   │   └── auth_service.py
│   │   ├── utils/
│   │   │   └── generators.py
│   │   ├── __init__.py          # Flask factory and database setup
│   │   └── models.py            # SQLAlchemy models and enums
│   ├── instance/
│   │   └── it_support.db       # Local SQLite database, created locally
│   ├── seed/
│   │   └── seed_data.py
│   ├── tests/
│   │   └── test_auth.py
│   ├── app.py                   # Backend entry point
│   ├── config.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/
├── PROJECT_PLAN.md
├── MILESTONE_1_COMPLETE.md
├── MILESTONE_2_COMPLETE.md
└── PROJECT_INSTRUCTIONS.md
```

## 4. Prerequisites

Install these before starting:

- Python 3.14 or newer
- Node.js and npm
- Git, recommended but not required
- VS Code, recommended

Check the installations from PowerShell:

```powershell
python --version
node --version
npm --version
```

Use the Python interpreter selected by VS Code/Pylance when possible.

## 5. First-Time Setup

Run these commands from the repository root:

```powershell
python -m pip install -r backend/requirements.txt

Push-Location frontend
npm install
Pop-Location
```

The backend configuration creates `backend/instance/` automatically. The SQLite database is stored at:

```text
backend/instance/it_support.db
```

## 6. Seed the Database

The seed script creates departments, users, assets, tickets, and comments.

From the repository root:

```powershell
Push-Location backend
python seed/seed_data.py
Pop-Location
```

Expected demo data:

- 6 departments
- 18 users
- 30 assets
- 50 tickets
- 49 ticket comments

The seed script is intended for development and demo data. Do not run it against a database containing data you need to preserve.

### Demo accounts

| Email | Password | Role |
|---|---|---|
| `user_id1.finance@company.com` | `user_id1` | `EMPLOYEE` |
| `user_id1.ics@company.com` | `user_id1` | `IT_SUPPORT` |
| `user_id2.ics@company.com` | `user_id2` | `IT_MANAGER` |

Credential convention:

- Employees outside ICS use `user_idN.department@company.com` with password `user_idN`.
- ICS support staff and managers use `user_idN.ics@company.com` with password `user_idN`.
- Numbering increases within each department or the ICS staff group.
- These predictable credentials are for local portfolio demonstration only.

For an existing local database, migrate credentials with:

```powershell
Push-Location backend
python migrate_demo_credentials.py
Pop-Location
```

All data is fictional.

## 7. Run the Backend

Open a terminal in the repository root:

```powershell
Push-Location backend
python app.py
```

The backend listens at:

```text
http://127.0.0.1:5000
```

Keep this terminal open. Use `Ctrl+C` to stop Flask, then run:

```powershell
Pop-Location
```

### Backend health check

In a second PowerShell terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

Expected result:

```text
status
------
ok
```

## 8. Run the Frontend Scaffold

Open another terminal from the repository root:

```powershell
Push-Location frontend
npm run dev
```

Vite normally provides:

```text
http://localhost:5173
```

The Vite configuration proxies `/api` requests to the Flask backend at `http://localhost:5000`.

### Current frontend scope

The React login, dashboard, ticket list/create/detail, comments, and asset list/detail screens are connected to the Flask API. Advanced asset administration controls and richer reporting are still future improvements.

## 9. Current API Reference

The current application endpoints are listed below.

### Health

```http
GET /api/health
```

Returns:

```json
{"status": "ok"}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "user_id1.finance@company.com",
  "password": "user_id1"
}
```

Successful response:

```json
{
  "user": {
    "id": 1,
    "employee_id": "...",
    "name": "...",
    "email": "user_id1.finance@company.com",
    "role": "EMPLOYEE",
    "department_id": 1,
    "is_active": true,
    "created_at": "..."
  }
}
```

The password hash is never returned.

### Current user

```http
GET /api/auth/me
```

This endpoint reads the Flask session cookie. It returns `401` when no active session exists.

### Logout

```http
POST /api/auth/logout
```

This clears the current Flask session.

## 10. Explore Authentication with PowerShell

Use a `WebRequestSession` so PowerShell preserves the login cookie:

```powershell
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$loginBody = @{
    email = 'user_id1.finance@company.com'
    password = 'user_id1'
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri http://127.0.0.1:5000/api/auth/login `
    -Method Post `
    -ContentType 'application/json' `
    -Body $loginBody `
    -WebSession $session

Invoke-RestMethod `
    -Uri http://127.0.0.1:5000/api/auth/me `
    -Method Get `
    -WebSession $session

Invoke-RestMethod `
    -Uri http://127.0.0.1:5000/api/auth/logout `
    -Method Post `
    -WebSession $session
```

Try all three demo accounts and compare their role-scoped ticket, asset, and dashboard results.

## 11. Run Tests

The tests are located in `backend/tests/`.

From the repository root:

```powershell
Push-Location backend
python -m pytest -q
Pop-Location
```

The current suite verifies:

- Valid login
- Invalid credentials
- Required login fields
- Session persistence
- Logout behavior
- Unauthenticated requests
- Role-based authorization denial
- Ticket creation, filtering, comments, assignments, and state transitions
- Asset creation, visibility, and assignment rules
- Audit event persistence and manager-only log access

The current expected result is 25 passing tests.

Milestone 8 validation also includes browser smoke checks for employee login, scoped dashboard data, ticket navigation, asset navigation, and manager-only navigation.

## 12. Understand the Backend Flow

### Application startup

1. `backend/app.py` loads environment variables.
2. `create_app()` creates the Flask application.
3. Configuration is loaded from `backend/config.py`.
4. SQLAlchemy is initialized.
5. Models are imported so SQLAlchemy knows the tables.
6. The auth, ticket, asset, and dashboard blueprints are registered.
7. Missing tables are created with `db.create_all()`.
8. Flask starts on port 5000.

### Login flow

1. The client sends email and password to `/api/auth/login`.
2. `auth.py` validates that both fields exist.
3. `auth_service.py` looks up the user by normalized email.
4. Inactive users and invalid passwords are rejected.
5. Werkzeug checks the stored password hash.
6. The session is cleared and receives only `user_id`.
7. The user dictionary is returned without `password_hash`.

### Protected route flow

1. A route uses `@login_required` or `@role_required(...)`.
2. The decorator reads `user_id` from the Flask session.
3. The active user is loaded from the database.
4. Missing or inactive users receive `401`.
5. Authenticated users with the wrong role receive `403`.
6. Authorized requests continue to the route function.

## 13. Understand the Database Models

The current models are in `backend/app/models.py`.

- `Department` has many users and assets.
- `User` can create tickets, receive assigned tickets, write comments, and receive assets.
- `Ticket` belongs to a creator and may have an assigned technician and related asset.
- `TicketComment` belongs to a ticket and an author.
- `Asset` belongs to a department and may be assigned to a user.

The enum values are stored as business-readable strings, such as `Open`, `Critical`, `Laptop`, and `IT_SUPPORT`.

## 14. What You Can Safely Do Now

You can:

- Start the backend and verify its health endpoint.
- Seed or reseed development data when you do not need to preserve local changes.
- Test login, logout, session behavior, and invalid credentials.
- Inspect `models.py` and trace relationships between records.
- Run the complete test suite before and after changes.
- Add new routes using the existing blueprint and decorator patterns.
- Use the three demo roles to understand the intended authorization model.
- Create tickets, add comments, filter tickets, and inspect status transitions.
- Review dashboard counts as different roles.
- Sign in as `user_id2.ics@company.com` and review manager-only audit activity.
- Sign in as `user_id2.ics@company.com` and use the manager-only Users page to review roles and account status.

## 15. What You Should Not Do Yet

Keep these limitations in mind:

- Do not treat the demo password as production-secure.
- Do not assume all future administration features are implemented.
- Do not expect the current audit log to replace production-grade migrations, retention, or compliance tooling.
- Do not commit `backend/instance/it_support.db` if the repository policy excludes local databases.
- Do not expose the development `SECRET_KEY` in a real deployment.
- Do not use `db.create_all()` as a replacement for migrations in a production system.
- Do not add authorization only in React; every permission must be enforced on the backend.
- Do not change database model fields casually after data exists without considering migration impact.

## 16. Implemented Ticket and Asset Workflows

Ticket APIs now include:

- `GET /api/tickets`
- `GET /api/tickets/<id>`
- `POST /api/tickets`
- `PUT` or `PATCH /api/tickets/<id>`
- Comment creation and listing
- Technician assignment
- Status transitions
- Filtering by status, priority, category, and assigned technician

The API enforces these rules server-side:

1. A ticket cannot be closed unless it is resolved and has a resolution.
2. A resolved ticket must contain a resolution.
3. Critical tickets require technician assignment.
4. Employees cannot modify tickets created by other employees.
5. Only IT support and IT managers can assign technicians or update operational ticket fields.
6. Ticket input must be validated before database writes.

Asset APIs include listing, detail, creation, updates, filtering, and assignment validation. The React pages are connected to these endpoints.

Audit APIs include:

- `GET /api/audit/logs` (IT_MANAGER only)
- Optional `action`, `entity_type`, and bounded `limit` filters
- Records for ticket creation, ticket updates, comments, asset creation, and asset updates

User administration APIs include:

- `GET /api/users` (IT_MANAGER only)
- `PATCH /api/users/<id>` (IT_MANAGER only)
- Role, active-status, name, and department updates
- Protection against self-deactivation and removal of the last active manager

## 17. Suggested Learning Path

For understanding the system well enough to explain it in an interview:

1. Run the backend health check.
2. Read `backend/app.py` and `backend/app/__init__.py`.
3. Read the five models in `backend/app/models.py`.
4. Run the seed script and inspect the resulting database.
5. Trace a login request through `auth.py` and `auth_service.py`.
6. Read `auth_middleware.py` and explain `401` versus `403`.
7. Start the frontend and sign in with a role-oriented demo account.
8. Run and modify one authentication test.
9. Implement one ticket endpoint at a time.
10. Add a test before adding each important business rule.
11. Connect the remaining frontend pages after the backend contract is stable.

A strong interview explanation should be able to answer:

- Why use an application factory?
- Why hash passwords instead of storing them directly?
- Why store only `user_id` in the session?
- What is the difference between authentication and authorization?
- Why must authorization be enforced on the backend?
- Why are business rules validated before committing a transaction?
- Why use SQLite for this scoped portfolio project?
- What would need to change before production deployment?

## 18. Stopping the Services

In each terminal running a server, press:

```text
Ctrl+C
```

The backend and frontend are separate processes. Stop both when finished.

## 19. Common Problems

### `python` is not recognized

Install Python or select the correct interpreter in VS Code. Verify with:

```powershell
python --version
```

### Database cannot be opened

Run the backend from the repository structure and let the application create `backend/instance/`. Do not manually change the SQLite URI without checking `backend/config.py`.

### Login returns `401`

Check that the database was seeded and that the email/password match the demo credentials exactly.

### Port 5000 is already in use

Stop the other Flask process or change the port in `backend/app.py` and update the Vite proxy accordingly.

### Frontend build errors appear

Run `npm.cmd install` from `frontend`, then run `npm.cmd run build`. If the backend is not running, the frontend can still build, but API-backed pages will show connection errors in the browser.

## 20. Development Principles

- Keep changes small and understandable.
- Prefer readable service and route code over clever abstractions.
- Validate input at the API boundary.
- Enforce security rules on the server.
- Add tests for behavior and business rules.
- Keep API responses consistent.
- Avoid unrelated refactoring during milestone work.
- Document architectural decisions that affect future changes.
