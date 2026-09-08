# User & Demonstration Guide: ICS - IT Central Support

This guide explains how to navigate, test, and demonstrate the application using the 3 built-in user personas.

---

## 🎭 Persona Overview

| Persona | Name | Role | Access Level |
| :--- | :--- | :--- | :--- |
| **Employee** | Tahsin Rahman | `EMPLOYEE` | Self-service: Log tickets, view assigned hardware, add comments |
| **IT Support** | Rakib Chowdhury | `IT_SUPPORT` | Operational: Assign tickets, change statuses, manage hardware assets |
| **IT Manager** | Md. Shahidul Islam Prodhan | `IT_MANAGER` | Governance: User administration, audit logs, full system oversight |

---

## ⚡ Instant 1-Click Guest Access

To explore any persona **without typing credentials**:
1. Open the login page (`/login`).
2. Click any of the **Instant Guest Access** buttons at the top:
   - `👤 Employee`
   - `🛠️ IT Support`
   - `🛡️ Manager`
3. The app logs you in immediately and loads the dashboard tailored to that role!

---

## 1. Employee Workflow Demo

1. **Dashboard Overview**:
   - Notice the greeting banner and self-service metrics showing tickets logged by your account.
2. **Log a Support Incident**:
   - Click **New Ticket** in the top right.
   - Enter title and description.
   - Select category (e.g. *Hardware*) and priority (e.g. *High*).
   - Link your hardware device using the **Related Hardware Asset** dropdown.
   - Click **Submit Ticket**.
3. **Follow Up on Ticket**:
   - You are redirected to the ticket details page.
   - Review the attached hardware card.
   - Add a comment to provide additional troubleshooting details.
4. **View Assigned Hardware**:
   - Click **Assets** in the navigation bar to see equipment currently checked out to your name.

---

## 2. IT Support Workflow Demo

1. **Review Incidents**:
   - Switch personas to **Rakib Chowdhury (IT Support)**.
   - Open **Tickets** from the navigation sidebar.
   - Use the live search bar (`q`) or status filters to locate tickets.
2. **Assign & Advance Ticket**:
   - Click on an open ticket.
   - Under **Operational Controls** on the right side:
     - Assign yourself as the technician.
     - Advance status to `In Progress`.
     - Click **Update Ticket**.
3. **Resolve Incident**:
   - Change status to `Resolved`.
   - Provide documented resolution notes (e.g. *"Replaced faulty cable and verified network ping"*).
   - Save updates.
4. **Manage Hardware Assets**:
   - Go to **Assets** in the sidebar.
   - Click **Register Asset** to add a newly procured workstation.
   - Open any asset to inspect its **Incident & Maintenance History**.
   - Click **Edit Asset Details** to reassign the device or update lifecycle status.

---

## 3. IT Manager Workflow Demo

1. **Governance & User Administration**:
   - Switch personas to **Md. Shahidul Islam Prodhan (IT Manager)**.
   - In the sidebar, notice the manager-exclusive links: **Audit Activity** and **Users**.
   - Click **Users** to view the employee directory.
   - Promote roles or deactivate accounts. (Safety rule: the system prevents deactivating the last active manager!).
2. **Inspect Audit Activity**:
   - Click **Audit Activity** in the sidebar.
   - Review the immutable event stream recording ticket updates, user modifications, and asset assignments with exact timestamps and actor IDs.
