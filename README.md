# 📋 Prosk Manager — Project & Task Management App

> **Fullstack Assignment** | Bliss Technologies | BLISS-FSD-002

A modern, full-featured **Project & Task Management** web application built with React + Redux (frontend) and Node.js/Express + PostgreSQL (backend).

## ✨ Features

### 🔐 Authentication
- **Signup & Login** with email/password
- **OTP-based email verification** after registration
- **JWT authentication** with auto-refresh and session persistence
- Protected routes — unauthorized users auto-redirected to login

### 📁 Projects
- **Create, view, edit, delete** projects
- Each project has: Title, Description, Status (Active/Completed/Archived)
- **Progress tracking** — visual progress bar based on task completion
- **Task count aggregation** per project
- **Search** by title/description, **filter** by status
- **Pagination** support

### ✅ Tasks
- **Create, edit, delete** tasks inside projects
- **Toggle complete/incomplete** with a single click
- Each task: Title, Description, Priority (High/Medium/Low), Status, Optional Due Date
- **Overdue detection** — highlights tasks past due date
- **Filter tasks** by status AND priority
- **Search** tasks by name

### 🎨 UI/UX
- Premium **dark mode** design with glassmorphism elements
- Smooth **animations and transitions**
- **Responsive** — works on mobile and desktop
- **Loading indicators** throughout the app
- Toast notifications for all actions
- Gradient accents and micro-animations

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| State Management | Redux Toolkit (with Thunk) |
| API Client | Axios (with interceptors) |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Authentication | JWT + OTP-based auth |
| Styling | Vanilla CSS (custom design system) |

## 📁 Project Structure

```
prosk-manager/
├── backend/
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection pool
│   │   └── schema.sql      # Database schema
│   ├── controllers/
│   │   ├── authController.js    # Register, OTP, Login
│   │   ├── projectController.js # Projects CRUD
│   │   └── taskController.js    # Tasks CRUD
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   └── errorHandler.js # Global error handling
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── .env                # Environment config
│   └── server.js           # Express app entry
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js     # Axios instance with interceptors
    │   ├── store/
    │   │   ├── store.js     # Redux store
    │   │   └── slices/
    │   │       ├── authSlice.js
    │   │       ├── projectSlice.js
    │   │       └── taskSlice.js
    │   ├── pages/
    │   │   ├── AuthPage.jsx      # Login + Register + OTP
    │   │   ├── Dashboard.jsx     # Projects overview
    │   │   └── ProjectDetail.jsx # Task management
    │   ├── components/
    │   │   └── Navbar.jsx
    │   └── index.css        # Complete design system
    └── .env
```

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- PostgreSQL (running locally)

### 1. Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE prosk_manager;
-- Then run the schema file:
\i backend/config/schema.sql
```

### 2. Backend

```bash
cd backend
# Configure your .env file
cp .env .env.local
# Update DB_PASSWORD and other values

npm install
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/resend-otp` | Resend OTP |
| GET | `/api/auth/me` | Get current user |

### Projects (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | Get all projects (search, filter, paginate) |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get single project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects/:id/tasks` | Get all tasks |
| POST | `/api/projects/:id/tasks` | Create task |
| PUT | `/api/projects/:id/tasks/:taskId` | Update task |
| PATCH | `/api/projects/:id/tasks/:taskId/toggle` | Toggle complete |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task |

## 🔒 Environment Variables

### Backend `.env`
```env
PORT=5000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prosk_manager
DB_USER=postgres
DB_PASSWORD=your_password
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Bonus Features Implemented
- ✅ Edit functionality for both projects and tasks
- ✅ Search and filtering (by status, priority, text)
- ✅ Pagination for projects list
- ✅ Overdue task detection
- ✅ Progress tracking with visual bar
- ✅ Smooth animations and micro-interactions

---

Built with ❤️ for Bliss Technologies Internship Assignment
