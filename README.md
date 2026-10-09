# DevFlow

![CI](https://github.com/AdityaSharma147/DevFlow/actions/workflows/ci.yml/badge.svg)

A full-stack team project management platform — think a lightweight Linear or Jira. Built to explore real-world authentication, role-based authorization, relational data modeling, real-time collaboration, and AI-assisted workflows from the ground up.

**Live demo:** [devflow-flame-one.vercel.app](https://devflow-flame-one.vercel.app)

> The backend runs on a free hosting tier that sleeps when idle, so the first request after a quiet period can take 30–60 seconds to wake up.

## Features

- **Authentication** — JWT-based auth with bcrypt password hashing and protected routes
- **Workspaces** — create workspaces, invite members, and manage roles (Admin / Manager / Developer / Viewer)
- **Projects & Tasks** — organize work into projects with prioritized, assignable tasks
- **Kanban board** — drag-and-drop task management with optimistic UI updates
- **Real-time updates** — WebSocket (Socket.IO) push for notifications, Kanban changes, and comments across connected users
- **Comments & Notifications** — collaborate on tasks; get notified on workspace invites and on comments for tasks assigned to you
- **Dashboard with data visualizations** — task status breakdown, priority distribution, and per-project completion charts, alongside an aggregated overview of your workspaces, tasks, and progress
- **GitHub integration** — connect your GitHub account via OAuth, link a repository to a project, and see its recent commit activity, pull requests, and issues — including a commit frequency chart — right on the project board
- **AI task generation** — describe a goal in plain language and get a generated task checklist, powered by Groq's LLM API
- **Global search** — debounced search across projects and tasks, scoped to your own workspaces
- **Role-based access control** — permissions enforced server-side at every layer, not just hidden in the UI
- **Light / dark theme** — persisted preference, applied across the entire app

## Tech Stack

| Layer    | Technologies                                           |
| -------- | ------------------------------------------------------ |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts        |
| Backend  | Node.js, Express, TypeScript, Socket.IO                |
| Database | PostgreSQL, Prisma ORM                                 |
| AI       | Groq (OpenAI-compatible LLM API)                       |
| Auth     | JWT, bcrypt, GitHub OAuth                              |
| Testing  | Jest, Supertest                                        |
| DevOps   | Docker, Docker Compose, GitHub Actions                 |
| Hosting  | Vercel (frontend), Render (backend), Neon (PostgreSQL) |

## Architecture

```mermaid
erDiagram
    USER ||--o{ WORKSPACE_MEMBER : joins
    WORKSPACE ||--o{ WORKSPACE_MEMBER : has
    USER ||--o{ WORKSPACE : owns

    WORKSPACE ||--o{ PROJECT : contains
    USER ||--o{ PROJECT : creates
    PROJECT ||--o{ PROJECT_MEMBER : has
    USER ||--o{ PROJECT_MEMBER : joins

    PROJECT ||--o{ TASK : contains
    USER |o--o{ TASK : "is assigned"
    USER ||--o{ TASK : creates

    TASK ||--o{ COMMENT : has
    USER ||--o{ COMMENT : writes

    USER ||--o{ NOTIFICATION : receives

    USER {
        string id PK
        string name
        string email UK
        string password "bcrypt hash"
        Role role
        string githubAccessToken "optional"
        string githubUsername "optional"
    }

    WORKSPACE {
        string id PK
        string name
        string description "optional"
        string ownerId FK
    }

    WORKSPACE_MEMBER {
        string id PK
        string userId FK "unique with workspaceId"
        string workspaceId FK
        Role role "ADMIN, MANAGER, DEVELOPER, VIEWER"
    }

    PROJECT {
        string id PK
        string name
        string description "optional"
        string workspaceId FK
        string createdById FK
        string githubRepo "optional"
    }

    PROJECT_MEMBER {
        string id PK
        string userId FK "unique with projectId"
        string projectId FK
        Role role
    }

    TASK {
        string id PK
        string title
        string description "optional"
        TaskStatus status "TODO, IN_PROGRESS, REVIEW, DONE"
        TaskPriority priority "LOW, MEDIUM, HIGH, URGENT"
        DateTime dueDate "optional"
        string[] labels
        string projectId FK
        string assigneeId FK "optional"
        string createdById FK
    }

    COMMENT {
        string id PK
        string content
        string taskId FK
        string authorId FK
    }

    NOTIFICATION {
        string id PK
        string message
        string link "optional"
        boolean read
        string userId FK
    }
```

**Data model:** `User` → `WorkspaceMember` (join table with role) → `Workspace` → `Project` → `ProjectMember` / `Task` → `Comment`, plus a `Notification` model. Roles are scoped per workspace, so the same user can be an Admin in one workspace and a Viewer in another. A connected GitHub account's token and username live on `User`; a linked repository lives on `Project`.

**Authorization** is centralized through reusable helpers (`getWorkspaceRole`, `canManageProjects`) rather than duplicated permission checks scattered across routes. Every protected action re-verifies the requester's role server-side, and a "last admin" guard prevents a workspace from ever ending up with no admins.

**Real-time layer:** the Socket.IO server shares the Express HTTP server and authenticates connections with the same JWT. Each user joins a personal room for notifications, and clients join a project room while viewing a board. Data is always written to the database first and pushed over the socket second, so a real-time failure never loses data, and clients resync from the database on reconnect.

**GitHub integration:** users connect their GitHub account via OAuth; the resulting access token and username are stored on their `User` record. A project can then be linked to one of the user's repositories, and the project board fetches that repo's recent commits, pull requests, and issues through the GitHub REST API, including a commit-frequency chart grouped by day.

## Running locally

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- A [Groq API key](https://console.groq.com) (free, no card required)
- A [GitHub OAuth App](https://github.com/settings/developers) (for the GitHub integration — optional for local dev if you don't need it)

### Environment variables

| Variable               | Where               | Purpose                                                                     |
| ---------------------- | ------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`         | server              | PostgreSQL connection string                                                |
| `JWT_SECRET`           | server              | Secret used to sign JWTs                                                    |
| `GROQ_API_KEY`         | server              | Groq API key for AI task generation                                         |
| `FRONTEND_URL`         | server (production) | Deployed frontend origin, allowed by CORS and used for post-OAuth redirects |
| `GITHUB_CLIENT_ID`     | server              | GitHub OAuth App client ID                                                  |
| `GITHUB_CLIENT_SECRET` | server              | GitHub OAuth App client secret                                              |
| `GITHUB_CALLBACK_URL`  | server              | OAuth callback URL, must match one registered on the GitHub OAuth App       |
| `VITE_API_URL`         | client (optional)   | API base URL; defaults to `http://localhost:5000/api`                       |

### Backend

```bash
cd server
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, GROQ_API_KEY, and GitHub OAuth values
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd client/my-app
npm install
npm run dev
```

The app runs at `http://localhost:5173`, with the API at `http://localhost:5000`.

## Running with Docker

The entire stack (frontend, backend, PostgreSQL) runs with a single command using Docker Compose.

1. Create a `.env` file at the project root:

```bash
  GROQ_API_KEY=your-key-here
```

2. Start everything:

```bash
   docker compose up
```

3. In a second terminal, apply the database migrations to the containerized Postgres (first run only):

```bash
   cd server
   npx dotenv -e .env -v DATABASE_URL="postgresql://postgres:postgres@localhost:5433/devflow" -- npx prisma migrate deploy
```

4. Visit `http://localhost:8080`

The first run builds both images; later runs are much faster thanks to Docker's layer caching.

## Testing

Backend routes are covered by automated Jest and Supertest tests, focused on authentication and role-based authorization — the highest-stakes logic in the app. Tests run against a separate database so your development data is never touched.

```bash
cd server
# create .env.test with DATABASE_URL pointing at a dedicated test database, then:
npx dotenv -e .env.test -- npx prisma migrate deploy
npm test
```

Coverage includes:

- User registration and login (including duplicate email and weak password rejection)
- Workspace role-based access control (Admin / Developer / outsider permission boundaries)
- Task-level authorization (Viewer restrictions) and partial-update correctness

## CI

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request: it starts a PostgreSQL service container, applies migrations, runs the Jest suite, and then verifies that both Docker images still build.

## What's next

- GitHub webhooks for live activity updates, instead of fetching on page load
- Burndown / velocity trend chart (requires tracking task status-change timestamps)
- Per-repository pull request and issue state charts
