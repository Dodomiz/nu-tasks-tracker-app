# NU - Tasks Management Application

[![GitHub](https://img.shields.io/badge/GitHub-Dodomiz%2Fnu--tasks--tracker--app-blue?logo=github)](https://github.com/Dodomiz/nu-tasks-tracker-app)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-47A248?logo=mongodb)](https://www.mongodb.com/)

Cross-platform task management application for families, couples, roommates, and small businesses with gamification features including leaderboards, competitive races, and rewards.

**Repository:** https://github.com/Dodomiz/nu-tasks-tracker-app

## 📋 Project Overview

**NU** enables transparent task assignment, automated scheduling, smart notifications, and gamification to address unclear task ownership and unfair workload distribution in shared environments.

### Key Features

- ✅ **Task Management** - Create, assign, and track tasks with deadlines and recurring schedules
- 👥 **Group Management** - Organize up to 20 members per group with role-based permissions
- 🎮 **Gamification** - Leaderboards, competitive races, and rewards system
- 📊 **Fair Distribution** - AI-powered workload balancing based on difficulty points
- 🔔 **Smart Notifications** - Customizable reminders and daily summaries
- 📱 **Cross-Platform** - Web (React) and Mobile (React Native - planned)
- ⚡ **Real-Time Updates** - Live synchronization across devices

## 🏗️ Architecture

### Tech Stack

**Backend:**
- .NET 9 + ASP.NET Core
- MongoDB (document database)
- JWT Authentication
- Serilog (logging)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Redux Toolkit + RTK Query (state management)
- Tailwind CSS (styling)
- React Router 6 (routing)

**Architecture Pattern:**
- Feature-based layered architecture
- Controllers → Services → Repositories → MongoDB
- Repository pattern for data access
- Async/await throughout for non-blocking I/O

## 📁 Project Structure

```
my-tasks-tracker-app/
├── backend/                 # ASP.NET Core API
│   ├── src/
│   │   └── TasksTracker.Api/
│   │       ├── Features/    # Feature modules (Auth, Groups, Tasks, etc.)
│   │       ├── Core/        # Domain models and interfaces
│   │       ├── Infrastructure/ # Data access and external services
│   │       └── Program.cs   # Application startup
│   └── tests/               # Backend tests
├── web/                     # React frontend
│   ├── src/
│   │   ├── app/            # Redux store and API slice
│   │   ├── features/       # Feature components (Auth, Dashboard, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   └── components/     # Shared UI components
│   └── public/             # Static assets
├── docs/                    # Documentation
│   ├── prd.md              # Product Requirements
│   └── design.md           # Technical Design
└── package.json            # Root scripts for running both projects
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+ (for web frontend)
- **.NET 9 SDK** (for backend API)
- **MongoDB** 4.4+ (local or MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   cd my-tasks-tracker-app
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install web dependencies:**
   ```bash
   npm run install:web
   ```

4. **Configure MongoDB:**
   
   Update `backend/src/TasksTracker.Api/appsettings.Development.json`:
   ```json
   {
     "MongoDbSettings": {
       "ConnectionString": "mongodb://localhost:27017",
       "DatabaseName": "TasksTrackerDb_Dev"
     }
   }
   ```

5. **Configure JWT Secret:**
   
   Update `backend/src/TasksTracker.Api/appsettings.Development.json`:
   ```json
   {
     "JwtSettings": {
       "SecretKey": "your-secure-256-bit-secret-key-minimum-32-characters",
       "Issuer": "TasksTrackerApi",
       "Audience": "TasksTrackerClients"
     }
   }
   ```

### Running the Application

**Option 1: Use the startup script (Recommended)**

On macOS/Linux:
```bash
./start-dev.sh
```

On Windows:
```bash
start-dev.bat
```

This starts both:
- Backend API at `https://localhost:7001`
- Frontend at `http://localhost:5173`

Press `Ctrl+C` to stop both servers.

**Option 2: Run with npm (if Node.js is installed)**

```bash
npm run dev
```

**Option 3: Run individually**

```bash
# Backend only (from project root)
cd backend/src/TasksTracker.Api && dotnet watch run

# Frontend only (from project root)
cd web && npm run dev
```

### Build for Production

```bash
# Build both projects
npm run build

# Build individually
npm run build:backend
npm run build:web
```

### Testing

```bash
# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:web
```

## 📖 Documentation

- **[Product Requirements (PRD)](docs/prd.md)** - Detailed feature specifications and acceptance criteria
- **[Technical Design](docs/design.md)** - Architecture, data models, and API specifications
- **[Backend README](backend/README.md)** - Backend-specific documentation
- **[Frontend README](web/README.md)** - Frontend-specific documentation

## 🔐 Authentication Flow

1. User registers with email/password
2. Email verification sent (future phase)
3. User logs in → receives JWT access token (60min) + refresh token (7 days)
4. Access token included in Authorization header for API requests
5. Refresh token used to obtain new access token when expired
6. Automatic token refresh on 401 errors (frontend)

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout

### Groups (Planned)
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/{id}` - Get group details
- `POST /api/groups/{id}/invite` - Invite member

### Tasks (Planned)
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `POST /api/tasks/{id}/complete` - Mark as complete
- `PUT /api/tasks/{id}/approve` - Approve completion

### Leaderboard (Planned)
- `GET /api/leaderboard/{groupId}` - Get group leaderboard

## 🛠️ Development

### Recommended Tools

- **Visual Studio Code** or **Visual Studio 2022** for backend
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - C# Dev Kit (for .NET)

### Code Style

- **Backend:** Follow .NET conventions (PascalCase for public members, camelCase for private)
- **Frontend:** Follow React/TypeScript conventions (camelCase, functional components)
- **Async/await:** Use throughout for all I/O operations
- **Error handling:** Use try-catch with centralized error middleware

### Project Guidelines

1. **Feature-based organization** - Keep related files together
2. **Repository pattern** - Abstract MongoDB access
3. **Typed Redux hooks** - Use `useAppDispatch` and `useAppSelector`
4. **RTK Query** - Use for all API calls, not axios directly
5. **Tailwind utilities** - Use utility classes, avoid custom CSS
6. **Primary constructors** - Use .NET 9 primary constructors for DI

## 🔒 Security Considerations

- **HTTPS only** in production
- **JWT tokens** with 256-bit signing key
- **Password hashing** using ASP.NET Core Identity (PBKDF2)
- **Rate limiting** on authentication endpoints (5 attempts/min)
- **Account lockout** after 5 failed login attempts
- **Parameterized queries** to prevent injection attacks
- **CORS** configured for allowed origins only

## 📊 Performance Targets

- API response time: <200ms (95th percentile)
- Web app load time: <3s
- Support 10,000 concurrent users
- 99.5% uptime SLA

## 🚧 Current Status

**✅ Completed:**
- Project structure and configuration
- Backend API skeleton with MongoDB integration
- JWT authentication middleware
- Frontend React app with routing
- Redux Toolkit + RTK Query setup
- Auth pages (Login, Register)
- Error handling middleware
- Logging with Serilog

**🔄 In Progress:**
- Backend service layer implementation
- Auth service (JWT generation, password hashing)
- Domain models for Groups, Tasks, Notifications, etc.

**📋 Planned:**
- Complete all CRUD operations
- Task scheduling and notifications
- Gamification features (leaderboard, races, rewards)
- Real-time updates with SignalR
- Mobile app (React Native/Expo)
- Email integration (SendGrid)
- Push notifications (FCM/APNS)

## 📝 License

Proprietary - All rights reserved

## 👥 Team

- Product Owner: [TBD]
- Tech Lead: [TBD]
- Backend Developer: [TBD]
- Frontend Developer: [TBD]

## 🔄 Git Workflow

### Cloning the Repository

```bash
git clone https://github.com/Dodomiz/nu-tasks-tracker-app.git
cd nu-tasks-tracker-app
```

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch (planned)
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Making Changes

```bash
# Create a feature branch
git checkout -b feature/my-new-feature

# Make your changes
git add .
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin feature/my-new-feature
```

### Commit Message Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🤝 Contributing

This project is open for contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For major changes, please open an issue first to discuss what you would like to change.

---

**Last Updated:** December 14, 2025
