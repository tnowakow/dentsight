# Dentsight Deployment Guide — Railway

This document outlines the steps required to deploy the Dentsight application to Railway and configure the necessary infrastructure (PostgreSQL + TimescaleDB).

## 🚀 Overview

Dentsight is a multi-tenant, high-performance dashboard. The deployment architecture consists of a single Node.js service on Railway hosting both the Express API and the React frontend (served as static assets), backed by a managed PostgreSQL instance with the TimescaleDB extension enabled.

---

## 🛠️ Prerequisites

1.  **Railway Account:** [railway.app](https://railway.app/)
2.  **GitHub Repository:** Ensure your code is pushed to a GitHub repo connected to Railway.
3.  **Domain Access:** Access to `dentsight.ai` DNS settings (e.g., Cloudflare, Namecheap).

---

## 1. Railway Project Setup

1.  **Create New Project:** Log in to Railway and click **"New Project"**.
2.  **Connect GitHub:** Select your Dents0ight repository.
3.  **Railway will detect the Dockerfile.** It should automatically set up a service using the `Dockerfile` provided.

## 2. Database Configuration (Postgres + TimescaleDB)

Dentsight requires PostgreSQL with the **TimescaleDB** extension for time-series performance.

1.  **Add PostgreSQL Service:**
    *   In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**.
2.  **Enable TimescaleDB:**
    *   Once the Postgres service is running, go to the **"Variables"** tab of the Postgres service.
    *   Railway's default Postgres image might not include TimescaleDB. If you need a specific version, use a custom Docker image or ensure the extension can be loaded. 
    *   *Note:* For standard Railway Postgres, run the following via the **"Railway CLI"** or a SQL client (like DBeaver) connected to the database:
        ```sql
        CREATE EXTENSION IF NOT EXISTS timescaledb;
        ```
3.  **Link Database to App:**
    *   Go to your **Dentsight Web Service** → **Variables**.
    *   Click **"New Variable"** or use the **"Reference"** feature.
    *   Add `DATABASE_URL` and set its value to `${{Postgres.DATABASE_URL}}`. This ensures the app always has the correct connection string even if the database restarts or moves.

## 3. Environment Variables Configuration

Go to your **Dentsight Web Service** → **Variables** tab in Railway and configure the following (use `.env.example` as a template):

| Variable | Description | Source / Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for Postgres | Reference `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | Secret for signing JWTs | Generate a random 256-bit string |
| `JWT_EXPIRY` | Token lifespan | `24h` |
| `EDGE_CONNECTOR_API_KEY` | Key used by Edge Connector | Securely generated key |
| `NODE_ENV` | Application mode | `production` |
| `PORT` | Listening port | `3000` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://dentsight.ai` |

*(Optional: Add TWILIO and SENDGRID variables if Phase 2 features are active.)*

## 4. Deployment Commands

If you need to trigger a manual deployment or check logs via CLI:

```bash
# Install Railway CLI if not present
npm i -g @railway/cli

# Login
railway login

# Deploy current directory
railway up

# View Logs
railway logs
```

## 5. Custom Domain Setup (`dentsight.ai`)

1.  **Railway Settings:**
    *   Go to your **Dentsight Web Service** → **Settings**.
    *   Find the **"Domains"** section.
    *   Click **"Custom Domain"** and enter `dentsight.ai` (or `app.dentsight.ai`).
2.  **DNS Configuration:**
    *   Railway will provide a CNAME target (e.g., `dentsight.up.railway.app`).
    *   Log in to your DNS provider (Cloudflare, etc.).
    *   Add a **CNAME record**:
        *   **Name:** `@` (for root) or `app` (for subdomain).
        *   **Target:** The Railway-provided URL.
    *   Wait for SSL propagation (Railway handles Let's Encrypt automatically).

---

## ✅ Post-Deployment Verification Checklist

Once the deployment is "Green" in Railway, verify the following:

- [ ] **Health Check:** Navigate to `https://dentsight.ai/api/health` — should return `200 OK`.
- [ ] **Static Assets:** Navigate to `https://dentsight.ai` — the React dashboard should load.
- [ ] **Database Connectivity:** Check Railway logs to ensure no "Connection Refused" errors on startup.
- [ ] **Auth Test:** Attempt a mock login (if testing endpoints) to verify `JWT_SECRET` is working.
- [ ] **CORS Check:** Ensure API calls from the frontend are not blocked by CORS policy.

---
*Prepared by John, DevOps Engineer for Dentsight Project.*
