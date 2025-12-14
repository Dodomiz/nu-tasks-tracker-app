# Web Frontend

React + TypeScript + Vite + Redux Toolkit + Tailwind CSS frontend for NU Tasks Management application.

## Tech Stack

- **React 18.3** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.1** - Build tool and dev server
- **Redux Toolkit 2.2** - State management
- **RTK Query** - Data fetching and caching
- **React Router 6.22** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS
- **Vitest** - Unit testing

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── store.ts           # Redux store configuration
│   │   └── api/
│   │       └── apiSlice.ts     # RTK Query base API
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.ts    # Auth state management
│   │   │   ├── authApi.ts      # Auth endpoints
│   │   │   └── pages/
│   │   │       ├── LoginPage.tsx
│   │   │       └── RegisterPage.tsx
│   │   └── dashboard/
│   │       └── pages/
│   │           └── DashboardPage.tsx
│   ├── hooks/
│   │   ├── useAppDispatch.ts   # Typed dispatch hook
│   │   └── useAppSelector.ts   # Typed selector hook
│   ├── components/             # Shared components
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript types
│   ├── App.tsx                 # Root component with routing
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles + Tailwind
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies and scripts
```

## Setup

1. Install dependencies:
```bash
cd web
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

API requests to `/api/*` are proxied to `https://localhost:7001` (backend server).

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests
- `npm run test:ui` - Run tests with UI

## State Management

### Redux Store
Located in `src/app/store.ts`, configures:
- RTK Query API slice for data fetching
- Auth slice for authentication state
- Automatic token refresh on 401 errors

### RTK Query
Base API configuration in `src/app/api/apiSlice.ts`:
- Automatically adds JWT bearer token to requests
- Handles token refresh on 401 errors
- Tag-based cache invalidation

Feature-specific endpoints are injected via `apiSlice.injectEndpoints()`:
- `src/features/auth/authApi.ts` - Authentication endpoints

### Auth State
Managed by `src/features/auth/authSlice.ts`:
- User profile
- Access token (60 minutes)
- Refresh token (7 days)
- Authentication status

## Routing

Routes defined in `src/App.tsx`:

**Public Routes:**
- `/login` - Login page
- `/register` - Registration page

**Protected Routes:**
- `/` - Dashboard (requires authentication)

Redirects:
- Authenticated users accessing `/login` or `/register` → redirect to `/`
- Unauthenticated users accessing protected routes → redirect to `/login`

## API Integration

### Base Configuration
Vite dev server proxies API requests:
- Frontend: `http://localhost:5173`
- Backend: `https://localhost:7001`
- Proxy: `/api/*` → `https://localhost:7001/api/*`

### Making API Calls

Use RTK Query hooks:

```typescript
// In a component
import { useLoginMutation } from '@/features/auth/authApi';

const [login, { isLoading, error }] = useLoginMutation();

const handleLogin = async () => {
  const result = await login({ email, password }).unwrap();
  // Handle success
};
```

### Adding New Endpoints

Inject endpoints into the API slice:

```typescript
// src/features/tasks/tasksApi.ts
import { apiSlice } from '@/app/api/apiSlice';

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const { useGetTasksQuery, useCreateTaskMutation } = tasksApi;
```

## Styling

Tailwind CSS with custom configuration:

**Custom Colors:**
- `primary-*` - Brand color palette (50-900)

**Custom Components:**
- `.btn` - Base button styles
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.input` - Form input styles
- `.card` - Card container

**Usage:**
```tsx
<button className="btn btn-primary">Click me</button>
<input className="input" />
<div className="card">Content</div>
```

## Environment Variables

Create `.env` file for environment-specific config:

```env
VITE_API_BASE_URL=https://localhost:7001
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Testing

Tests use Vitest + React Testing Library.

Example test structure:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Build for Production

```bash
npm run build
```

Output in `dist/` directory. Serve with any static file server.

## Next Steps

Features to implement:
1. Tasks management (create, update, delete, assign)
2. Groups/teams management
3. Notifications system
4. Leaderboard and gamification
5. Real-time updates (WebSockets/SignalR)
6. Profile management
7. Settings and preferences
