# ICS - IT Central Support - Project Plan

**Portfolio Project for IT Intern Application - Financial Services Context**

*This is a fictional educational portfolio project designed to demonstrate IT operations knowledge, not affiliated with any real company.*

---

## 1. PROPOSED FOLDER STRUCTURE

```
it-support-asset/
├── backend/                          # Flask REST API
│   ├── app.py                        # Flask app entry point
│   ├── config.py                     # Configuration (dev, test, prod)
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment template
│   ├── .gitignore                    # Git exclusions
│   │
│   ├── app/
│   │   ├── __init__.py               # App factory
│   │   ├── models.py                 # SQLAlchemy models (User, Ticket, Asset, etc.)
│   │   ├── database.py               # Database initialization
│   │   │
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # Authentication endpoints
│   │   │   ├── tickets.py            # Ticket CRUD + operations
│   │   │   ├── assets.py             # Asset CRUD + operations
│   │   │   └── dashboard.py          # Dashboard metrics
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py       # Login, logout, session logic
│   │   │   ├── ticket_service.py     # Business logic for tickets
│   │   │   ├── asset_service.py      # Business logic for assets
│   │   │   └── dashboard_service.py  # Dashboard metrics calculation
│   │   │
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   └── auth_middleware.py    # Authentication & authorization checks
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── validators.py         # Input validation
│   │       ├── errors.py             # Custom exceptions
│   │       └── helpers.py            # Utility functions
│   │
│   ├── seed/
│   │   ├── __init__.py
│   │   └── seed_data.py              # Demo data generation script
│   │
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py               # pytest configuration & fixtures
│       ├── test_auth.py              # Authentication tests
│       ├── test_tickets.py           # Ticket functionality tests
│       ├── test_assets.py            # Asset functionality tests
│       └── test_authorization.py     # Role-based access tests
│
├── frontend/                         # React + Vite
│   ├── package.json                  # Node dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── index.html                    # HTML entry point
│   ├── .env.example                  # Environment template
│   ├── .gitignore                    # Git exclusions
│   │
│   ├── src/
│   │   ├── main.jsx                  # React app entry
│   │   ├── App.jsx                   # App shell and routing
│   │   ├── index.css                 # Global styles
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Authentication page
│   │   │   ├── Dashboard.jsx         # Home/dashboard
│   │   │   ├── Tickets.jsx           # Ticket list
│   │   │   ├── NewTicket.jsx         # Ticket creation
│   │   │   ├── TicketDetail.jsx      # Ticket details & activity
│   │   │   ├── Assets.jsx            # Asset list
│   │   │   ├── AssetDetail.jsx       # Asset details
│   │   │   └── NotFound.jsx          # 404 page
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── Header.jsx            # Top header with user info
│   │   │   ├── TicketTable.jsx       # Reusable ticket table
│   │   │   ├── AssetTable.jsx        # Reusable asset table
│   │   │   ├── StatusBadge.jsx       # Status display badge
│   │   │   ├── PriorityBadge.jsx     # Priority display badge
│   │   │   └── ProtectedRoute.jsx    # Role-based route protection
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                # API client (axios wrapper)
│   │   │   ├── auth.js               # Authentication service
│   │   │   ├── tickets.js            # Ticket API calls
│   │   │   ├── assets.js             # Asset API calls
│   │   │   └── dashboard.js          # Dashboard API calls
│   │   │
│   │   └── context/
│   │       └── AuthContext.jsx       # User/auth state management
│   │
│   └── public/                       # Static assets
│       └── favicon.ico
│
├── docs/
│   ├── architecture.md               # System architecture details
│   ├── database-design.md            # Database schema & relationships
│   ├── api-documentation.md          # API endpoint reference
│   ├── testing.md                    # Testing strategy & guide
│   ├── user-guide.md                 # How to use the application
│   └── deployment.md                 # Setup and run instructions
│
├── README.md                         # Project overview & quick start
├── .gitignore                        # Global git exclusions
└── MILESTONES.md                     # This document

```

---

## 2. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER BROWSER                                  │
│                   (HTTP Client)                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP / JSON
                           │
        ┌──────────────────▼──────────────────────┐
        │   React + Vite Frontend Application    │
        ├──────────────────────────────────────────┤
        │  • Pages (Login, Dashboard, Tickets...) │
        │  • Components (Tables, Forms, Badges)   │
        │  • API Client Service Layer             │
        │  • Authentication Context               │
        │  • Client-side Validation               │
        └──────────────────┬──────────────────────┘
                           │
                           │ axios/fetch
                           │ /api/...
                           │
        ┌──────────────────▼──────────────────────┐
        │  Flask Backend REST API                 │
        ├──────────────────────────────────────────┤
        │  • Route Handlers (/auth, /tickets, etc)│
        │  • Authentication Middleware            │
        │  • Business Logic Services              │
        │  • Input Validation                     │
        │  • Authorization Checks                 │
        │  • Error Handling                       │
        └──────────────────┬──────────────────────┘
                           │
                           │ SQLAlchemy ORM
                           │
        ┌──────────────────▼──────────────────────┐
        │   SQLite Database                      │
        ├──────────────────────────────────────────┤
        │  • Users & Roles                        │
        │  • Tickets & Comments                   │
        │  • Assets                               │
        │  • Departments                          │
        └──────────────────────────────────────────┘
```

### Key Design Principles
- **Separation of Concerns**: Frontend and backend are logically separated
- **Server Authority**: Backend owns business rules, validation, and authorization
- **REST API**: Stateless HTTP endpoints with JSON payloads
- **Database Abstraction**: SQLAlchemy ORM prevents SQL injection
- **Role-Based Access**: Three user roles with server-side enforcement

---

## 3. DATABASE SCHEMA (ER Description)

### Tables

#### DEPARTMENT
- `id` (PK, Integer)
- `name` (String, unique)

#### USER
- `id` (PK, Integer)
- `employee_id` (String, unique)
- `name` (String)
- `email` (String, unique)
- `password_hash` (String)
- `role` (Enum: EMPLOYEE, IT_SUPPORT, IT_MANAGER)
- `department_id` (FK → DEPARTMENT)
- `is_active` (Boolean, default: true)
- `created_at` (DateTime)

#### TICKET
- `id` (PK, Integer)
- `ticket_number` (String, unique) — e.g., "INC-000001"
- `title` (String)
- `description` (Text)
- `category` (Enum: Hardware, Software, Network, Account & Access, Security, Other)
- `priority` (Enum: Low, Medium, High, Critical)
- `status` (Enum: Open, Assigned, In Progress, Resolved, Closed)
- `created_by` (FK → USER)
- `assigned_to` (FK → USER, nullable)
- `asset_id` (FK → ASSET, nullable)
- `resolution` (Text, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)
- `resolved_at` (DateTime, nullable)

#### TICKET_COMMENT
- `id` (PK, Integer)
- `ticket_id` (FK → TICKET)
- `user_id` (FK → USER)
- `comment` (Text)
- `created_at` (DateTime)

#### ASSET
- `id` (PK, Integer)
- `asset_tag` (String, unique) — e.g., "ASSET-000001"
- `asset_type` (Enum: Laptop, Desktop, Monitor, Printer, Router, Switch, Mobile Device, Other)
- `brand` (String)
- `model` (String)
- `serial_number` (String)
- `purchase_date` (Date)
- `warranty_expiry` (Date, nullable)
- `status` (Enum: Available, Assigned, Under Repair, Retired, Lost)
- `assigned_to` (FK → USER, nullable)
- `department_id` (FK → DEPARTMENT)
- `notes` (Text, nullable)
- `created_at` (DateTime)

### Key Relationships
- User → Department (many-to-one)
- Ticket → User (created_by) (many-to-one)
- Ticket → User (assigned_to) (many-to-one, nullable)
- Ticket → Asset (many-to-one, nullable)
- TicketComment → Ticket (many-to-one)
- TicketComment → User (many-to-one)
- Asset → User (assigned_to) (many-to-one, nullable)
- Asset → Department (many-to-one)

---

## 4. IMPLEMENTATION MILESTONES & COMPLEXITY

### MILESTONE 1: Project Scaffold & Architecture
**Objective**: Create project structure, initialize dependencies, establish baseline.

**Tasks**:
- Create folder structure
- Initialize backend (Flask, SQLAlchemy, pytest)
- Initialize frontend (React, Vite)
- Set up Vite proxy for /api routing
- Configure environment files (.env)
- Set up basic Flask app with CORS
- Create initial Git repository

**Dependencies**:
- Flask, Flask-SQLAlchemy, Werkzeug (password hashing)
- pytest, pytest-flask
- React, Vite, axios
- Bootstrap (CSS framework)

**Complexity**: ⭐ LOW  
**Estimated Time**: 30-45 minutes  
**Risk**: Low—standard scaffolding  
**Testing**: Manual (app runs, no errors on startup)

---

### MILESTONE 2: Database Models & Seed Data
**Objective**: Define all database entities and populate with realistic demo data.

**Tasks**:
- Define SQLAlchemy models (User, Ticket, Asset, Department, TicketComment)
- Create database initialization
- Implement ticket number generation (INC-000001 format)
- Implement asset tag generation (ASSET-000001 format)
- Create seed data script with ~15-20 users, ~30 assets, ~50 tickets
- Ensure seed data covers all categories, priorities, statuses, roles
- Test database initialization and queries

**Complexity**: ⭐ LOW-MEDIUM  
**Estimated Time**: 1-1.5 hours  
**Risk**: Low-Medium—requires careful data relationships  
**Testing**: Run seed script, inspect database, verify relationships

---

### MILESTONE 3: Flask API & Authentication
**Objective**: Build authentication system and foundational API structure.

**Tasks**:
- Implement password hashing (Werkzeug)
- Create authentication service (login, logout, session validation)
- Implement auth middleware (check session, set user context)
- Create auth routes (POST /auth/login, POST /auth/logout, GET /auth/me)
- Implement session management (Flask sessions)
- Create error handling & response formatting
- Add input validation utilities
- Create authorization decorators

**Complexity**: ⭐ MEDIUM  
**Estimated Time**: 1.5-2 hours  
**Risk**: Medium—authentication is critical; must be done correctly  
**Testing**: pytest tests for login, logout, session validation, invalid credentials

---

### MILESTONE 4: Ticket Functionality (Backend)
**Objective**: Implement complete ticket CRUD and business logic.

**Tasks**:
- Create ticket routes (GET /api/tickets, POST, GET/:id, PATCH, DELETE)
- Implement ticket service (create, update, change status, resolve)
- Implement ticket filtering & search (by status, priority, category, assignee)
- Implement comment routes (GET /api/tickets/:id/comments, POST)
- Enforce business rules:
  - Cannot close without resolution
  - Cannot resolve without resolution text
  - Critical tickets require assignment
  - Employees can only modify own tickets
  - Only IT_SUPPORT/IT_MANAGER can assign/change status
- Validation (required fields, enum values, string lengths)
- Error responses (400, 403, 404, 409)

**Complexity**: ⭐ MEDIUM  
**Estimated Time**: 2-2.5 hours  
**Risk**: Medium—business rules must be enforced server-side  
**Testing**: pytest tests for create, update, status transitions, comments, validation, authorization

---

### MILESTONE 5: Asset Functionality (Backend)
**Objective**: Implement complete asset CRUD and business logic.

**Tasks**:
- Create asset routes (GET /api/assets, POST, GET/:id, PATCH, DELETE)
- Implement asset service (create, update, assign, unassign)
- Implement asset filtering & search
- Enforce business rules:
  - Assigned assets must have assigned_to set
  - Available assets must have assigned_to null
  - Only IT_SUPPORT/IT_MANAGER can manage assets
- Validation (enum values, dates, required fields)
- Error responses

**Complexity**: ⭐ LOW-MEDIUM  
**Estimated Time**: 1-1.5 hours  
**Risk**: Low—simpler than tickets; fewer business rules  
**Testing**: pytest tests for create, update, assign/unassign, state validation, authorization

---

### MILESTONE 6: React Frontend
**Objective**: Build all frontend pages and components.

**Tasks**:

**Components**:
- Sidebar (navigation, logout)
- Header (user info, role display)
- StatusBadge (display ticket status)
- PriorityBadge (display priority)
- TicketTable (reusable list)
- AssetTable (reusable list)
- ProtectedRoute (role-based access)

**Pages**:
- Login: Form with email/password, error handling, redirect if authenticated
- Dashboard: Metrics cards, charts (by category/status), recent tickets table
- Tickets: Filter/search, table with status/priority, create button, row click → detail
- NewTicket: Form (title, category, priority, description, asset), submit creates ticket
- TicketDetail: Show all fields, status/priority dropdowns (if authorized), comments section
- Assets: List with filter/search, create button, row click → detail
- AssetDetail: Show all fields, edit form (if authorized), related tickets

**Functionality**:
- AuthContext for session management
- API service layer (axios wrapper)
- Protected routes based on roles
- Form validation (client-side for UX)
- Error displays
- Loading states
- Bootstrap styling

**Complexity**: ⭐ MEDIUM-HIGH  
**Estimated Time**: 2.5-3.5 hours  
**Risk**: Medium—many pages to build; state management must be correct  
**Testing**: Manual (click-through all pages, verify role-based visibility)

---

### MILESTONE 7: Dashboard & Polish
**Objective**: Refine dashboard, UI consistency, operational visualization.

**Tasks**:
- Implement dashboard metrics:
  - Total/open/in-progress/resolved/critical tickets
  - Total/assigned/available/under-repair/retired assets
- Create charts (tickets by category, tickets by status)
- Polish table sorting/pagination
- Improve form validation messaging
- Consistent styling (spacing, colors, fonts)
- Loading spinners
- Error alerts
- Responsive design verification

**Complexity**: ⭐ LOW-MEDIUM  
**Estimated Time**: 1.5-2 hours  
**Risk**: Low—mostly UI refinement  
**Testing**: Manual (verify metrics accuracy, responsive on mobile)

---

### MILESTONE 8: Testing & Bug Fixes
**Objective**: Comprehensive testing and reliability verification.

**Tasks**:
- Run full pytest suite
- Fix any failing tests
- Test all user workflows:
  - Employee creates ticket, views it
  - IT_SUPPORT assigns and resolves ticket
  - IT_MANAGER views dashboard
  - Asset assignment/unassignment
  - Invalid state transitions (blocked)
  - Invalid credentials (rejected)
- Edge cases (empty lists, null values, malformed requests)
- Performance check (database queries, API response times)
- Security check (no plaintext passwords, no credential leaks in responses)
- Cross-browser testing (Chrome, Firefox, Edge)

**Complexity**: ⭐ MEDIUM  
**Estimated Time**: 1.5-2 hours  
**Risk**: Medium—may uncover integration issues  
**Testing**: pytest + manual end-to-end

---

### MILESTONE 9: Documentation & Portfolio Prep
**Objective**: Complete all documentation for portfolio submission.

**Tasks**:
- Write README.md (overview, setup, demo credentials, features, architecture)
- Write docs/architecture.md (detailed system design)
- Write docs/database-design.md (schema, relationships, rationale)
- Write docs/api-documentation.md (all endpoints, request/response examples)
- Write docs/testing.md (test strategy, how to run tests)
- Write docs/user-guide.md (how to use the application)
- Add comments to critical code
- Verify no secrets in repo (.env examples only)
- Verify no real personal/company data
- Final visual inspection (no broken links, UI clean)

**Complexity**: ⭐ LOW  
**Estimated Time**: 1-1.5 hours  
**Risk**: Low—documentation  
**Testing**: Manual (follow setup instructions, verify all links work)

---

## 5. TECHNOLOGY STACK & DEPENDENCIES

### Backend (Python)
```
Flask==2.3.x                          # Web framework
Flask-SQLAlchemy==3.0.x               # ORM integration
SQLAlchemy==2.0.x                     # Database ORM
Werkzeug==2.3.x                       # Password hashing
python-dotenv==1.0.x                  # Environment variables
pytest==7.4.x                         # Testing framework
pytest-flask==1.2.x                   # Flask test utilities
```

### Frontend (Node)
```
react                                 # UI library
react-dom                             # React DOM rendering
react-router-dom                      # Page routing (if needed)
vite                                  # Build tool & dev server
axios                                 # HTTP client
bootstrap                             # CSS framework
```

### Development Tools
```
Git                                   # Version control
```

---

## 6. RISK ASSESSMENT

| Task | Risk Level | Mitigation |
|------|-----------|-----------|
| Database schema | LOW | Review carefully before implementation |
| Authentication | MEDIUM | Follow Werkzeug best practices, test thoroughly |
| Business rules enforcement | MEDIUM | Implement server-side only, comprehensive tests |
| Role-based authorization | MEDIUM | Test each role with protected operations |
| React state management | MEDIUM | Use simple Context API (no Redux) |
| API integration | LOW-MEDIUM | Proxy config + axios error handling |
| Frontend forms | LOW | Bootstrap + client-side validation for UX |
| Testing | LOW | Use pytest fixtures for isolation |
| Documentation | LOW | Template-based, straightforward writing |

---

## 7. ESTIMATED TOTAL TIME

- Milestone 1: 0.5 hours
- Milestone 2: 1.25 hours
- Milestone 3: 1.75 hours
- Milestone 4: 2.25 hours
- Milestone 5: 1.25 hours
- Milestone 6: 3 hours
- Milestone 7: 1.75 hours
- Milestone 8: 1.75 hours
- Milestone 9: 1.25 hours

**Total: ~15-17 hours** (realistic estimate for a complete, production-quality portfolio application)

---

## 8. NEXT STEPS

1. **Review this plan** — Confirm structure, tech stack, and milestones make sense
2. **Approve or suggest changes** — Any adjustments before we begin?
3. **Start Milestone 1** — Project scaffold (once approved)
4. **Follow milestone workflow** — Complete one milestone, test, review before next

---

**Ready to proceed? Please confirm the plan, then we'll begin Milestone 1.**
