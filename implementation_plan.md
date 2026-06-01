# Deployment Strategy: Prosk Manager

Deploying a full-stack application involves three separate pieces: the Frontend, the Backend, and the Database. Since this is for an internship assignment, we will use the absolute best **free** platforms in the industry.

## User Review Required

> [!IMPORTANT]
> You will need to create free accounts on three platforms. I cannot do this for you since it requires your email/Google account. 
> 
> Are you comfortable creating accounts on these platforms? If so, we will tackle them one by one.

## Open Questions

- Do you already have accounts on Vercel, Render, or GitHub? (Since you just pushed to GitHub, that part is done!)

## Proposed Infrastructure Stack

We will use the modern "serverless/cloud" stack that is highly respected by tech companies.

### 1. Database: Neon (neon.tech)
* **Why:** Neon provides a lightning-fast, free Serverless PostgreSQL database that never expires. (Other free databases usually expire after 90 days).
* **Our Step:** We will create a database there, get the connection string, and run our `schema.sql` to build the tables.

### 2. Backend (Node.js): Render (render.com)
* **Why:** Render is the easiest platform to deploy Node.js APIs for free directly from GitHub.
* **Our Step:** We will connect your GitHub repo to Render. It will automatically build and start your Node.js server. We will give it the database connection string and your Email App Password.

### 3. Frontend (React/Vite): Vercel (vercel.com)
* **Why:** Vercel is built for React. It is insanely fast and provides a beautiful free URL (e.g., `prosk-manager.vercel.app`).
* **Our Step:** We will connect Vercel to your GitHub repo. It will automatically build the React code. We will point it to the live Render Backend URL.

---

## The Step-by-Step Execution Plan

We must do this in a specific order for it to work:

1. **Phase 1: Database (Neon)**
   - Create DB and run `schema.sql`.
   - Get the live `DATABASE_URL`.
2. **Phase 2: Backend (Render)**
   - Connect GitHub.
   - Add `.env` variables (Database URL, Email credentials).
   - Deploy and get the live API URL (e.g., `https://prosk-backend.onrender.com`).
3. **Phase 3: Frontend (Vercel)**
   - Connect GitHub.
   - Set `VITE_API_URL` to the Render backend URL.
   - Deploy!

> [!TIP]
> If you approve this plan, I will guide you through **Phase 1 (Database)** first. Just say "Approved!"
