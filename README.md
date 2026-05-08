# 🚀 TASKO — Team Task Management Platform

> A full-stack collaborative task management system with role-based access control, project management, and real-time team coordination.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://proactive-adventure-production.up.railway.app |
| **Backend API** | https://tasko-teamtaskmanager-production.up.railway.app |
| **API Health** | https://tasko-teamtaskmanager-production.up.railway.app/ |

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.2.6 | React Framework (App Router) |
| **React** | 19.2.4 | UI Library |
| **TypeScript** | ^5 | Type Safety |
| **Tailwind CSS** | ^4 | Utility-first Styling |
| **Axios** | ^1.16.0 | HTTP Client |
| **Lucide React** | ^1.14.0 | Icon Library |
| **Radix UI** | ^1.2.4 | Headless UI Components |
| **js-cookie** | ^3.0.5 | Cookie Management |
| **clsx + tailwind-merge** | — | Conditional Class Utilities |

### ⚙️ Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20 | JavaScript Runtime |
| **Express.js** | ^5.2.1 | Web Framework |
| **TypeScript** | ^6.0.3 | Type Safety |
| **Prisma ORM** | ^6.19.3 | Database ORM & Migrations |
| **SQLite** | — | Embedded Database |
| **bcryptjs** | ^3.0.3 | Password Hashing |
| **jsonwebtoken** | ^9.0.3 | JWT Authentication |
| **Zod** | ^4.4.3 | Schema Validation |
| **cors** | ^2.8.6 | Cross-Origin Resource Sharing |
| **helmet** | ^8.1.0 | HTTP Security Headers |
| **morgan** | ^1.10.1 | HTTP Request Logging |
| **cookie-parser** | ^1.4.7 | Cookie Parsing Middleware |
| **dotenv** | ^17.4.2 | Environment Variables |
| **tsx** | ^4.21.0 | TypeScript Runtime (no compile step) |

### 🚀 Deployment & DevOps
| Technology | Purpose |
|-----------|---------|
| **Railway** | Cloud Hosting (Backend + Frontend) |
| **Nixpacks** | Auto Build System |
| **Docker** | Frontend Containerization |
| **GitHub** | Version Control & CI/CD |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     TASKO Platform                      │
├────────────────────┬────────────────────────────────────┤
│   Frontend         │   Backend                          │
│   (Next.js)        │   (Express.js)                     │
│                    │                                    │
│  ┌──────────────┐  │  ┌──────────┐   ┌──────────────┐  │
│  │ App Router   │──┼─▶│ REST API │──▶│  Prisma ORM  │  │
│  │ Pages        │  │  │          │   │              │  │
│  │ Components   │  │  │ /api/auth│   └──────┬───────┘  │
│  └──────────────┘  │  │ /api/proj│          │          │
│                    │  │ /api/task│   ┌──────▼───────┐  │
│  ┌──────────────┐  │  │ /api/team│   │   SQLite DB  │  │
│  │ Axios Client │  │  └──────────┘   └──────────────┘  │
│  │ JWT via      │  │                                    │
│  │ Cookie/LS    │  │  ┌──────────────────────────────┐  │
│  └──────────────┘  │  │  Middleware Stack             │  │
│                    │  │  helmet | cors | morgan       │  │
│                    │  │  auth | role | validate       │  │
└────────────────────┴──┴──────────────────────────────────┘
```

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login & registration with token stored in cookie + localStorage
- 👥 **Role-Based Access Control (RBAC)** — ADMIN and MEMBER roles with different permissions
- 📁 **Project Management** — Create, update, and track projects with deadlines and priorities
- ✅ **Task Management** — Assign tasks to team members with status tracking (TODO → IN_PROGRESS → DONE)
- 👤 **Team Management** — Add/remove members from projects, manage roles
- 💬 **Comments** — Add comments to tasks for collaboration
- 📊 **Dashboard** — Overview of projects, tasks, and team activity
- ⚙️ **Profile Settings** — Update profile info and change password

---

## 📁 Project Structure

```
TASKO/
├── backend/                    # Express.js API Server
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── task.controller.ts
│   │   │   └── team.controller.ts
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth.ts         # JWT verification
│   │   │   ├── role.ts         # RBAC enforcement
│   │   │   ├── validate.ts     # Zod schema validation
│   │   │   └── error.ts        # Global error handler
│   │   ├── routes/             # API route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── utils/
│   │   │   ├── jwt.ts          # Token utilities
│   │   │   └── prisma.ts       # Prisma client singleton
│   │   └── app.ts              # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── railway.json            # Railway deployment config
│   ├── nixpacks.toml           # Nixpacks build config
│   └── package.json
│
├── frontend/                   # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Auth pages (login, register)
│   │   │   ├── (dashboard)/    # Protected dashboard pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── projects/
│   │   │   │   ├── tasks/
│   │   │   │   ├── team/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── layout/Sidebar.tsx
│   │   │   └── ui/button.tsx
│   │   └── lib/
│   │       ├── api.ts          # Axios instance & interceptors
│   │       └── utils.ts
│   ├── Dockerfile              # Docker config for Railway
│   ├── railway.json            # Railway deployment config
│   └── package.json
│
└── docker-compose.yml          # Local development setup
```

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register new user |
| `POST` | `/login` | Login user |
| `POST` | `/logout` | Logout user |
| `GET` | `/me` | Get current user |
| `PUT` | `/profile` | Update profile |
| `PUT` | `/password` | Change password |

### Projects (`/api/projects`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all projects |
| `POST` | `/` | Create project |
| `GET` | `/:id` | Get project by ID |
| `PUT` | `/:id` | Update project |
| `DELETE` | `/:id` | Delete project |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all tasks |
| `POST` | `/` | Create task |
| `PUT` | `/:id` | Update task |
| `DELETE` | `/:id` | Delete task |

### Team (`/api/team`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/:projectId` | Get project members |
| `POST` | `/:projectId/add` | Add member to project |
| `DELETE` | `/:projectId/:userId` | Remove member |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20+
- npm

### Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend `.env`:**
```env
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Schema

```prisma
User          → Projects (owns many)
User          → ProjectMember (member of many projects)
User          → Task (assigned to many tasks)
User          → Comment (author of many)

Project       → ProjectMember (has many members)
Project       → Task (has many tasks)

Task          → Comment (has many comments)
```

---

## 🔒 Security Features

- **Helmet.js** — Sets secure HTTP headers
- **bcryptjs** — Passwords hashed with salt rounds
- **JWT** — Stateless authentication with expiry
- **Zod validation** — All inputs validated before processing
- **CORS** — Configured for specific allowed origins
- **RBAC** — Role middleware protects admin-only routes

---

## 👨‍💻 Developer

**Dhruv Panday**  
GitHub: [@dhruvpanday1](https://github.com/dhruvpanday1)

---

*Built with ❤️ using Next.js, Express.js, Prisma & Railway*
