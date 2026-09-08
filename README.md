# ICS - IT Central Support

**Portfolio Project for IT Intern Application — Financial Services Context**

A realistic internal IT operations web application demonstrating practical knowledge of IT support workflows, ticket management, asset inventory, REST APIs, relational databases, and role-based authorization.

**This is a fictional educational portfolio project designed to simulate internal IT operations in a financial-services environment. It is not affiliated with or representative of any company's internal systems.**

---

## Project Status

🟢 **Core local workflow complete** — authentication, dashboard, tickets, assets, and tests are implemented

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed implementation roadmap.

---

## Quick Start

See [PROJECT_INSTRUCTIONS.md](PROJECT_INSTRUCTIONS.md) for complete setup, run, exploration, testing, and troubleshooting instructions.

From the repository root, install dependencies:

```powershell
python -m pip install -r backend/requirements.txt
Push-Location frontend
npm.cmd install
Pop-Location
```

Start Flask in one terminal:

```powershell
Push-Location backend
python app.py
```

Start Vite in another terminal:

```powershell
Push-Location frontend
npm.cmd run dev
```

Open `http://localhost:5173` and use `user_id1.finance@company.com` / `user_id1`.

---

## Technology Stack

**Backend**: Python, Flask, SQLAlchemy, SQLite  
**Frontend**: React, Vite, Bootstrap, Axios  
**Testing**: pytest  
**Version Control**: Git

---

## Key Features

- ✅ Session-based authentication (3 user roles)
- ✅ Ticket management (create, assign, resolve, comment)
- ✅ Asset inventory (manage hardware, track status)
- ✅ Role-based authorization (EMPLOYEE, IT_SUPPORT, IT_MANAGER)
- ✅ Operational dashboard metrics
- ✅ Bootstrap responsive UI
- ✅ Business rule enforcement (server-side validation)
- ✅ Backend test suite
- 🚧 Advanced administration, reporting, and production deployment hardening

---

## Documentation

- [architecture.md](docs/architecture.md) — System design
- [database-design.md](docs/database-design.md) — Database schema
- [api-documentation.md](docs/api-documentation.md) — API reference
- [deployment.md](docs/deployment.md) — Cloud deployment (Render, Docker, Local)
- [testing.md](docs/testing.md) — Testing guide
- [user-guide.md](docs/user-guide.md) — Application usage & demo workflows

---

## ⚡ 1-Click Instant Demo Access

When running the application, you do **not need to memorize or type credentials** to review the features. On the login screen (`/login`), click any of the **Instant Guest Access** buttons:
- 👤 **Employee** (Tahsin Rahman) — Self-service ticket submission & personal equipment tracking
- 🛠️ **IT Support** (Rakib Chowdhury) — Incident assignment, status workflow progression, hardware asset updates
- 🛡️ **IT Manager** (Md. Shahidul Islam Prodhan) — User administration, manager audit logs, organizational governance

---

## 🚀 Cloud & Production Deployment

The project is configured for **1-click cloud deployment on Render.com** or any container environment (Docker / VPS):
- **Render.com**: Connect your GitHub repository and deploy via [render.yaml](render.yaml)
- **Docker**: Run `docker compose up --build`
- See [docs/deployment.md](docs/deployment.md) for step-by-step instructions.
