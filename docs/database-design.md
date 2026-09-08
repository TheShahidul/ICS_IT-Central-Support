# Database Design: ICS - IT Central Support

This document describes the relational database schema, entities, relationships, constraints, and design rationale.

---

## 1. Entity-Relationship Overview

```
 +--------------------+       1:N       +--------------------+
 |     DEPARTMENT     | <-------------  |        USER        |
 +--------------------+                 +--------------------+
          |                                 |          |
          | 1:N                             | 1:N      | 1:N (created_by)
          |                                 |          v
          v 1:N (assigned_to)               |   +--------------------+
 +--------------------+ <-------------------+   |       TICKET       |
 |       ASSET        |                         +--------------------+
 +--------------------+                                |         |
          |                                        1:N |         | 1:N
          +--------------------------------------------+         |
                         1:N (asset_id)                          v
                                                        +--------------------+
                                                        |   TICKET_COMMENT   |
                                                        +--------------------+

 +--------------------+
 |     AUDIT_LOG      | (Immutable operational event records)
 +--------------------+
```

---

## 2. Table Schemas & Constraints

### 1. `department`
Represents internal business units (e.g. Finance, Operations, Human Resources, IT).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Department primary key |
| `name` | String(255) | Unique, NOT NULL | Department name |
| `created_at` | DateTime | NOT NULL, Default `now()` | Creation timestamp |

### 2. `user`
Represents staff members across all business units and IT roles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | User identifier |
| `employee_id`| String(50) | Unique, NOT NULL | Employee identification code |
| `name` | String(255) | NOT NULL | Full name |
| `email` | String(255) | Unique, NOT NULL | Corporate email address |
| `password_hash`| String(255)| NOT NULL | Hashed credentials |
| `role` | String(50) | NOT NULL, Default `EMPLOYEE` | Role (`EMPLOYEE`, `IT_SUPPORT`, `IT_MANAGER`) |
| `department_id`| Integer | FK -> `department.id`, NOT NULL | Department reference |
| `is_active` | Boolean | Default `true`, NOT NULL | Active status flag |
| `created_at` | DateTime | NOT NULL, Default `now()` | Account creation timestamp |

### 3. `asset`
Represents physical hardware inventory deployed or in storage.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Asset identifier |
| `asset_tag` | String(20) | Unique, NOT NULL | E.g., `ASSET-000001` |
| `asset_type`| String(50) | NOT NULL | `Laptop`, `Desktop`, `Monitor`, `Printer`, etc. |
| `brand` | String(100) | NOT NULL | Manufacturer (e.g., Dell, Apple, Cisco) |
| `model` | String(100) | NOT NULL | Hardware model designation |
| `serial_number`| String(100)| Nullable | Manufacturer serial code |
| `purchase_date`| Date | Nullable | Acquisition date |
| `warranty_expiry`| Date | Nullable | Manufacturer warranty end date |
| `status` | String(50) | NOT NULL, Default `Available` | `Available`, `Assigned`, `Under Repair`, `Retired`, `Lost` |
| `assigned_to`| Integer | FK -> `user.id`, Nullable | Assigned user custodian |
| `department_id`| Integer | FK -> `department.id`, NOT NULL | Physical department allocation |
| `notes` | Text | Nullable | Maintenance & operational history notes |
| `created_at` | DateTime | NOT NULL, Default `now()` | Record creation timestamp |

### 4. `ticket`
Represents IT support requests and incident records.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Ticket identifier |
| `ticket_number`| String(20)| Unique, NOT NULL | E.g., `INC-000001` |
| `title` | String(255) | NOT NULL | Summary of the issue |
| `description`| Text | NOT NULL | Detailed problem description |
| `category` | String(50) | NOT NULL | `Hardware`, `Software`, `Network`, `Account & Access`, etc. |
| `priority` | String(50) | NOT NULL, Default `Medium` | `Low`, `Medium`, `High`, `Critical` |
| `status` | String(50) | NOT NULL, Default `Open` | `Open`, `Assigned`, `In Progress`, `Resolved`, `Closed` |
| `created_by` | Integer | FK -> `user.id`, NOT NULL | Author of the ticket |
| `assigned_to`| Integer | FK -> `user.id`, Nullable | Assigned technician (`IT_SUPPORT` / `IT_MANAGER`) |
| `asset_id` | Integer | FK -> `asset.id`, Nullable | Attached hardware asset |
| `resolution` | Text | Nullable | Documented resolution notes |
| `created_at` | DateTime | NOT NULL, Default `now()` | Ticket creation timestamp |
| `updated_at` | DateTime | NOT NULL, Default `now()` | Last modification timestamp |
| `resolved_at`| DateTime | Nullable | Timestamp when issue was marked Resolved |

### 5. `ticket_comment`
Represents correspondence and updates on an incident.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Comment identifier |
| `ticket_id` | Integer | FK -> `ticket.id`, NOT NULL | Ticket reference |
| `user_id` | Integer | FK -> `user.id`, NOT NULL | Author reference |
| `comment` | Text | NOT NULL | Content of comment |
| `created_at` | DateTime | NOT NULL, Default `now()` | Comment timestamp |

### 6. `audit_log`
Immutable operational ledger recording high-impact transactions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Log identifier |
| `actor_id` | Integer | FK -> `user.id`, NOT NULL | User who initiated action |
| `action` | String(80) | NOT NULL | E.g., `ticket.updated`, `asset.created`, `user.updated` |
| `entity_type`| String(50) | NOT NULL | E.g., `ticket`, `asset`, `user` |
| `entity_id` | Integer | NOT NULL | Target entity identifier |
| `details` | JSON | Nullable | Structured change parameters |
| `created_at` | DateTime | NOT NULL, Default `now()` | Timestamp of event |
