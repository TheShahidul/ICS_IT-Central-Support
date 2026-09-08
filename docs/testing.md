# Testing Guide: ICS - IT Central Support

This guide describes the automated test suite, execution instructions, and test coverage across the backend application.

---

## 1. Running the Automated Test Suite

From the `backend/` directory:

```powershell
python -m pytest
```

Alternatively, from the repository root:

```powershell
pytest backend/
```

The repository includes `backend/pytest.ini` with `addopts = -p no:flask` to ensure consistent execution across Python 3.11, 3.12, and 3.14 without legacy plugin conflicts.

---

## 2. Test Suite Organization

| Test Module | Coverage Scope | Key Tests |
| :--- | :--- | :--- |
| `tests/test_auth.py` | Authentication & Session | Login valid/invalid, password hash exclusion, logout, current user `/me` |
| `tests/test_tickets.py` | Incident Management | Ticket creation, validation, assignment rules, status transitions, resolution enforcement |
| `tests/test_assets.py` | Hardware Inventory | Asset CRUD, status validation, custodian assignment rules |
| `tests/test_users.py` | RBAC & User Administration | Role-based authorization, technician lookups, manager privileges, last-manager protection |
| `tests/test_edge_cases.py` | Boundary Conditions | SQL injection prevention, malformed JSON handling, negative pagination limits, inactive accounts |
| `tests/test_phase1.py` | Search & Endpoints | Department endpoint, full-text ticket search, asset filtering, asset maintenance history |

---

## 3. Frontend Validation

To verify that all JSX files, components, and CSS styles compile cleanly into a production bundle:

```powershell
Push-Location frontend
npm.cmd run build
Pop-Location
```

Expected result:
```
✓ 1876 modules transformed.
dist/index.html                   0.49 kB
dist/assets/index-...css        245 kB
dist/assets/index-...js         258 kB
✓ built in ~2.3s
```
