# Tech Context: Zoho Hours Register

## Technology Stack
- **Framework**: Next.js 16 (App Router, React Server Components for layout)
- **Frontend**: React 18 with TypeScript
- **UI Base**: TailAdmin free dashboard template
- **Styling**: Tailwind CSS v4, tailwind-merge for class composition
- **Icons**: lucide-react
- **API Routes**: Next.js App Router API routes (serverless on Vercel)
- **Deployment**: Vercel
- **State Persistence**: localStorage (credentials, tokens, projects, checkpoints)
- **Zoho API**: REST via `ZohoClient` class + `zohoFetch` wrapper with auto-refresh

## Key Dependencies
### Production
- `next` 16.0.10, `react` 18.3.1, `react-dom` 18.3.1
- `tailwindcss` 4.x, `@tailwindcss/forms`, `@tailwindcss/postcss`
- `lucide-react` 0.560 (icons)
- `tailwind-merge` (class merging utility)
- `@fullcalendar/*` (TailAdmin template — not used by app)
- `apexcharts`, `react-apexcharts` (TailAdmin template — not used by app)
- `swiper`, `react-dropzone`, `react-dnd` (TailAdmin template — not used by app)
- `flatpickr` (TailAdmin template — not used by app)

### Dev
- `typescript` 5.x, `@types/react`, `@types/react-dom`
- `eslint` 9.x, `eslint-config-next`
- `postcss`, `autoprefixer`
- `@svgr/webpack` (SVG as React components)

## Project Structure
```
src/
├── app/
│   ├── layout.tsx                          # Root layout (ThemeProvider > SidebarProvider > AuthProvider)
│   ├── globals.css                         # Global styles, Tailwind theme, animations
│   ├── (admin)/
│   │   ├── layout.tsx                      # Admin layout (minimal, no TailAdmin sidebar/header)
│   │   ├── page.tsx                        # Main dashboard page (timer + dashboard/task-matching)
│   │   └── (others-pages)/
│   │       └── profile/page.tsx            # Settings/profile page (OAuth + portal config)
│   └── api/zoho/
│       ├── token/route.ts                  # POST: OAuth token exchange & refresh
│       ├── projects/
│       │   ├── route.ts                    # GET: List all projects
│       │   └── [projectId]/
│       │       ├── route.ts                # GET: Single project details
│       │       └── tasks/
│       │           ├── route.ts            # GET: Tasks for a project
│       │           └── [taskId]/
│       │               └── timelogs/
│       │                   └── route.ts    # POST: Create time log for task
├── components/
│   └── dashboard/
│       ├── TimerSidebar.tsx                # Timer with checkpoints and descriptions
│       ├── TaskMatching.tsx                # Task similarity matching + time log submission
│       ├── ProjectsOverview.tsx            # Project cards (add/remove/toggle)
│       ├── TasksTable.tsx                  # Filterable task list
│       ├── SetupWizard.tsx                 # 4-step onboarding wizard
│       ├── StatsCards.tsx                  # Summary stat cards
│       ├── ConnectionStatus.tsx            # Zoho connection indicator
│       └── DurationDisplay.tsx             # Live-updating timer display
├── context/
│   ├── AuthContext.tsx                     # Zoho auth state (tokens, credentials, status)
│   ├── SidebarContext.tsx                  # Sidebar expand/collapse (TailAdmin)
│   └── ThemeContext.tsx                    # Dark/light theme toggle
├── hooks/
│   ├── useProjects.ts                     # Project management (add/remove/toggle, localStorage)
│   ├── useModal.ts                        # Generic modal state
│   └── useGoBack.ts                       # Navigation back helper
├── lib/
│   ├── zohoClient.ts                      # ZohoClient class (API wrapper for projects/tasks/timelogs)
│   ├── zohoFetch.ts                       # Client-side fetch with auto 401→refresh→retry
│   └── dataProvider.js                    # DataProvider (task fetching orchestration, color helpers)
├── layout/                                # TailAdmin layout components (NOT used in admin layout)
├── icons/                                 # SVG icon components
└── types/
    └── index.ts                           # Checkpoint and DashboardTask interfaces
```

## Configuration
### Environment Variables (.env.local — development only)
- `ZOHO_CLIENT_ID` — OAuth client ID
- `ZOHO_CLIENT_SECRET` — OAuth client secret
- `ZOHO_ACCESS_TOKEN` — Initial access token (dev convenience)
- `ZOHO_PORTAL_NAME` — Portal ID (dev convenience)

### User Configuration (production — localStorage)
- `zoho_credentials` — `{ clientId, clientSecret, portalId, portalName, portalSlug, displayName }`
- `zoho_tokens` — `{ access_token, refresh_token }`
- `user_projects` — Array of `{ id, name, status, active }` objects
- `zoho-checkpoints` — Array of checkpoint objects
- `current-checkpoint` — Active checkpoint state
- `logged-checkpoint-ids` — Array of checkpoint IDs that have been logged

## API Architecture
All API routes are thin proxies that:
1. Read `x-zoho-access-token` and `x-zoho-portal-id` from request headers
2. Create a `ZohoClient` instance
3. Forward the request to Zoho Projects API
4. Return the response

The token endpoint (`/api/zoho/token`) is the exception — it handles OAuth token exchange and refresh, keeping client_secret server-side.

## Zoho API Details
- **Base URL**: `https://projectsapi.zoho.com/restapi/portal/{portalId}/`
- **Auth Header**: `Zoho-oauthtoken {token}` or `Bearer {token}` (tokens starting with `1000.` use Bearer)
- **Token Endpoint**: `https://accounts.zoho.com/oauth/v2/token`
- **Portal ID**: `632970450` (Mickael's portal)

## Build & Run
```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
npm run lint    # ESLint
```
