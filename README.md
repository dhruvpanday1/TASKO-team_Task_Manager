# TASKO — Team Task Management App

## Live Demo
- 🌐 Frontend: `<your-railway-frontend-url>`
- 🔌 Backend API: `<your-railway-backend-url>`

## GitHub Repository
`<your-github-repo-url>`

---

## Features

### ✅ User Authentication
- Signup with Name, Email, Password
- Secure JWT login with httpOnly cookies
- Auto-logout on token expiry (401 interceptor)

### ✅ Project Management
- Create projects (creator auto-assigned as Admin)
- Admin: Add/remove members by email
- Admin: Assign roles (Admin / Member)
- Members: View assigned projects and tasks

### ✅ Task Management
- Create tasks with Title, Description, Due Date, Priority
- Assign tasks to any project member
- Update status: To Do → In Progress → Review → Completed
- Overdue task detection with visual indicators

### ✅ Dashboard
- Total tasks, Completed, In Progress, In Review, Overdue
- Completion rate circular chart
- **Tasks per user** progress breakdown
- Project count

### ✅ Role-Based Access Control
- **Admin**: Manage members, create/assign/delete tasks
- **Member**: View and update status of assigned tasks only
- Backend enforces roles on every protected endpoint

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind-free Vanilla CSS |
| Backend | Node.js, Express.js, TypeScript, tsx |
| Database | PostgreSQL (production) / SQLite (development) |
| ORM | Prisma v6 |
| Auth | JWT + httpOnly Cookies |
| Deployment | Railway |

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (or use SQLite for local dev — no setup needed)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit DATABASE_URL
npx prisma migrate dev
npm run dev            # Runs on port 5000
```

### Frontend

```bash
cd frontend
npm install
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev            # Runs on port 3000
```

---

## Deployment on Railway

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin <your-github-url>
git push -u origin main
```

### Step 2 — Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `backend` folder as root
3. Add a **PostgreSQL** service from Railway
4. Set environment variables:
   ```
   DATABASE_URL=<from Railway PostgreSQL>
   JWT_SECRET=<your-secret>
   FRONTEND_URL=<your-frontend-url>
   NODE_ENV=production
   PORT=5000
   ```
5. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
6. Start command: `npm start`

### Step 3 — Deploy Frontend on Railway
1. New Service → GitHub → select `frontend` folder
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://<your-backend-url>/api
   ```
3. Build: `npm install && npm run build`
4. Start: `npm start`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/projects` | Yes | List projects |
| POST | `/api/projects` | Yes | Create project |
| GET | `/api/projects/:id` | Yes | Project detail |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Owner | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Admin | Remove member |
| GET | `/api/tasks` | Yes | My tasks |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/:id` | Member | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/tasks/stats` | Yes | Dashboard stats |
| GET | `/api/team` | Yes | Team members |
