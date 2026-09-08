# REST API Reference: ICS - IT Central Support

All API endpoints reside under `/api` and exchange JSON payloads. Session cookies (`session`) are used for authentication.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates user with email and password.
- **Request Body**:
  ```json
  { "email": "user_id1.finance@company.com", "password": "user_id1" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "employee_id": "USER001",
      "name": "Alice Johnson",
      "email": "user_id1.finance@company.com",
      "role": "EMPLOYEE",
      "department_id": 1,
      "department_name": "Finance",
      "is_active": true
    }
  }
  ```

### `POST /api/auth/demo-login`
Instant 1-click login for portfolio review with zero password typing required.
- **Request Body**:
  ```json
  { "role": "EMPLOYEE" }
  ```
  *(Options: `EMPLOYEE`, `IT_SUPPORT`, `IT_MANAGER`)*
- **Response (200 OK)**: Sets session cookie and returns user profile.

### `POST /api/auth/logout`
Terminates the current session.
- **Response (200 OK)**: `{ "message": "Logged out successfully" }`

### `GET /api/auth/me`
Returns current authenticated user profile.
- **Response (200 OK)**: `{ "user": { ... } }` or `401 Unauthorized`

---

## 2. Incident & Ticket Endpoints

### `GET /api/tickets`
List tickets. Employees only see their own tickets; IT Support and Managers see all.
- **Query Parameters**:
  - `q`: Search keyword across ticket number, title, description
  - `status`: `Open`, `Assigned`, `In Progress`, `Resolved`, `Closed`
  - `priority`: `Low`, `Medium`, `High`, `Critical`
  - `category`: `Hardware`, `Software`, `Network`, `Account & Access`, `Security`, `Other`
  - `assigned_to`: Technician User ID
- **Response (200 OK)**: `{ "tickets": [ ... ] }`

### `POST /api/tickets`
Create a new support ticket.
- **Request Body**:
  ```json
  {
    "title": "VPN connection drops every 10 minutes",
    "description": "Attempted reconnecting to the US-East gateway with no improvement.",
    "category": "Network",
    "priority": "High",
    "asset_id": 4
  }
  ```
- **Response (201 Created)**: `{ "ticket": { ... } }`

### `GET /api/tickets/<id>`
Get ticket details including comments and assigned technician.
- **Response (200 OK)**: `{ "ticket": { ... } }`

### `PATCH /api/tickets/<id>`
Update operational fields (IT Support & Manager only).
- **Request Body**:
  ```json
  {
    "status": "Resolved",
    "assigned_to": 2,
    "resolution": "Updated network profile certificates and reset adapter."
  }
  ```
- **Response (200 OK)**: `{ "ticket": { ... } }`

### `POST /api/tickets/<id>/comments`
Post a comment/note to an incident.
- **Request Body**: `{ "comment": "Technician has scheduled diagnosis for 2 PM." }`
- **Response (201 Created)**: `{ "comment": { ... } }`

---

## 3. Hardware Asset Endpoints

### `GET /api/assets`
List hardware assets with multi-parameter filtering.
- **Query Parameters**:
  - `q`: Search keyword across asset tag, brand, model, serial number
  - `status`: `Available`, `Assigned`, `Under Repair`, `Retired`, `Lost`
  - `asset_type`: `Laptop`, `Desktop`, `Monitor`, `Printer`, etc.
  - `department_id`: Department ID
- **Response (200 OK)**: `{ "assets": [ ... ] }`

### `POST /api/assets`
Register new hardware asset (`IT_SUPPORT` / `IT_MANAGER` only).
- **Request Body**:
  ```json
  {
    "asset_type": "Laptop",
    "brand": "Dell",
    "model": "XPS 15",
    "serial_number": "SN-88214-D",
    "department_id": 1,
    "status": "Available",
    "purchase_date": "2026-01-15",
    "warranty_expiry": "2029-01-15",
    "notes": "Procured for trading analytics team"
  }
  ```
- **Response (201 Created)**: `{ "asset": { ... } }`

### `GET /api/assets/<id>`
Get detailed asset specifications and assigned custodian.
- **Response (200 OK)**: `{ "asset": { ... } }`

### `GET /api/assets/<id>/tickets`
Retrieve all past and active tickets logged against a specific hardware device.
- **Response (200 OK)**: `{ "tickets": [ ... ] }`

### `PATCH /api/assets/<id>`
Update hardware lifecycle status, custodian assignment, warranty, or notes.
- **Response (200 OK)**: `{ "asset": { ... } }`

---

## 4. Administrative & Department Endpoints

### `GET /api/departments`
List all corporate departments with user and asset counts.
- **Response (200 OK)**: `{ "departments": [ ... ] }`

### `GET /api/dashboard/summary`
Calculates real-time incident counters and hardware inventory metrics.
- **Response (200 OK)**:
  ```json
  {
    "tickets": {
      "total": 50,
      "by_status": { "Open": 10, "In Progress": 15, "Resolved": 20, "Closed": 5 },
      "by_priority": { "Low": 8, "Medium": 25, "High": 12, "Critical": 5 }
    },
    "assets": {
      "total": 30,
      "by_status": { "Available": 6, "Assigned": 18, "Under Repair": 3, "Retired": 3 }
    }
  }
  ```

### `GET /api/users` & `PATCH /api/users/<id>`
Manager-only user administration for promoting roles and toggling active status.

### `GET /api/audit/logs`
Manager-only immutable event log inspection.
