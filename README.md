# DevFlow

A full-stack team project management platform — think a lightweight Linear or Jira. Built to explore real-world authentication, role-based authorization, relational data modeling, and AI-assisted workflows from the ground up.

**Live demo:** _coming soon_

## Features

- **Authentication** — JWT-based auth with bcrypt password hashing and protected routes
- **Workspaces** — create workspaces, invite members, manage roles (Admin / Manager / Developer / Viewer)
- **Projects & Tasks** — organize work into projects, each with its own task list
- **Kanban board** — drag-and-drop task management with optimistic UI updates
- **Comments & Notifications** — collaborate on tasks with comments; get notified on invites, assignments, and activity
- **Dashboard** — an aggregated overview of your workspaces, tasks, and progress
- **AI task generation** — describe a goal in plain language and get a generated checklist of tasks, powered by Groq's LLM API
- **Global search** — debounced search across projects and tasks, scoped to your own workspaces
- **Role-based access control** — permissions enforced server-side at every layer, not just hidden in the UI

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS
**Backend:** Node.js, Express, TypeScript
**Database:** PostgreSQL with Prisma ORM
**AI:** Groq (OpenAI-compatible LLM API)
**Auth:** JWT, bcrypt

## Architecture

Data model: `User` → `WorkspaceMember` (join table with role) → `Workspace` → `Project` → `ProjectMember` / `Task` → `Comment`, plus a `Notification` model.

Authorization is centralized through reusable helpers (`getWorkspaceRole`, `canManageProjects`) rather than duplicated permission checks scattered across routes — every protected action re-verifies the requester's role server-side.

## Running locally

### Prerequisites
- Node.js
- PostgreSQL (v15+)
- A [Groq API key](https://console.groq.com) (free, no card required)

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your DATABASE_URL, JWT_SECRET, and GROQ_API_KEY
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd client/my-app
npm install
npm run dev
```

The app will be running at `http://localhost:5173`, with the API at `http://localhost:5000`.

## What's next

- Automated testing (Jest + Supertest)
- WebSocket-based real-time notifications
- Docker + CI/CD
- Production deployment
