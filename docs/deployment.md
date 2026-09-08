# Deployment Guide: ICS - IT Central Support

This guide covers deploying **ICS - IT Central Support** to **Render.com** (recommended for production/portfolio hosting), containerized deployment using **Docker**, and local execution.

---

## 🚀 Option 1: 1-Click Deploy on Render.com (Recommended)

Render is the optimal free/low-cost platform for this project because it runs both the Flask backend and React frontend as a **unified single web service** on one domain (avoiding cross-origin cookie blockers).

### Step-by-Step Instructions

#### 1. Push Your Code to GitHub
Ensure your latest code (including `render.yaml`, `build.sh`, `Dockerfile`, and `backend/wsgi.py`) is committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure production deployment and guest access"
git push origin main
```

#### 2. Create a Free Account on Render
Go to [render.com](https://render.com) and sign up (or sign in with GitHub).

#### 3. Deploy via Blueprint (Fastest)
1. In the Render Dashboard, click **New +** at the top right and select **Blueprint**.
2. Connect your GitHub repository (`ICS_IT-Central-Support` / `it-support-asset`).
3. Render will automatically detect [render.yaml](file:///d:/WORKS_PROJECTS/it-support-asset/render.yaml) and pre-configure the service:
   - **Service Name**: `ics-it-central-support`
   - **Environment**: `Python`
   - **Plan**: `Free`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn --chdir backend wsgi:app`
   - **Health Check Path**: `/api/health`
4. Click **Apply**.

#### 4. Alternative: Manual Web Service Setup on Render
If you prefer not using Blueprint:
1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Set the following fields:
   - **Name**: `ics-it-support` (or your preferred name)
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn --chdir backend wsgi:app`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = *(click Generate or enter a random string)*
   - `PYTHON_VERSION` = `3.11.8`
   - `SESSION_COOKIE_SECURE` = `true`
5. Click **Create Web Service**.

#### 5. Verify Your Live Deployment
- Render will run `./build.sh` (which builds the React Vite frontend and installs Python dependencies).
- When the service starts, the database is automatically created and populated with demo departments, assets, and tickets.
- Visit your live URL (e.g., `https://ics-it-central-support.onrender.com`).
- Use the **⚡ Instant Guest Access** buttons on the login screen to explore as **Employee**, **IT Support**, or **IT Manager** with zero typing!

---

## 🐳 Option 2: Docker Container Deployment

The repository includes a production multi-stage [Dockerfile](file:///d:/WORKS_PROJECTS/it-support-asset/Dockerfile) that builds the frontend with Node 20 and packages it with Python 3.11 and Gunicorn.

### Using Docker Compose (Local or VPS)

To build and run locally:
```bash
docker compose up --build
```
Open your browser at `http://localhost:5000`. The database data persists in the `app_data` Docker volume.

### Standalone Docker Build

```bash
# Build the production image
docker build -t ics-it-support:latest .

# Run the container
docker run -d -p 5000:5000 --name ics_app ics-it-support:latest
```

---

## 💻 Option 3: Local Development Run

For active coding and hot-reload development:

### 1. Backend (Terminal 1)
```powershell
python -m pip install -r backend/requirements.txt
Push-Location backend
python app.py
```
Backend runs on `http://127.0.0.1:5000`.

### 2. Frontend (Terminal 2)
```powershell
Push-Location frontend
npm.cmd install
npm.cmd run dev
```
Frontend runs on `http://localhost:5173` with proxy forwarding `/api` requests to port 5000.

---

## 🗄️ Database Notes

- **Default (SQLite)**: SQLite works out-of-the-box locally and in containers.
- **Render PostgreSQL (Optional)**: If you want persistent PostgreSQL on Render:
  1. In Render, create a free **PostgreSQL Database**.
  2. Copy the **Internal Database URL**.
  3. In your Web Service environment variables, add `DATABASE_URL` with that value.
  4. The app automatically translates `postgres://` to `postgresql://` and connects to Postgres!
