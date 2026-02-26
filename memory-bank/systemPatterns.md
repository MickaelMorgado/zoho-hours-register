# System Patterns: Zoho Hours Register

## System Architecture
```
┌──────────────────────────────┐
│   Next.js App (Vercel)       │
│                              │
│  ┌────────────────────────┐  │     ┌──────────────────────┐
│  │ React Frontend         │  │     │   Zoho APIs          │
│  │                        │  │     │                      │
│  │ - TimerSidebar         │  │     │ projectsapi.zoho.com │
│  │ - TaskMatching         │  │     │  /restapi/portal/... │
│  │ - ProjectsOverview     │──┼────►│  - /projects/        │
│  │ - TasksTable           │  │     │  - /tasks/           │
│  │ - SetupWizard          │  │     │  - /timelogs/        │
│  │ - StatsCards            │  │     │                      │
│  └────────┬───────────────┘  │     │ accounts.zoho.com    │
│           │                  │     │  /oauth/v2/token     │
│  ┌────────▼───────────────┐  │     └──────────────────────┘
│  │ API Routes (Serverless)│  │
│  │                        │  │
│  │ /api/zoho/token        │──┼────► OAuth token exchange
│  │ /api/zoho/projects     │──┼────► Project listing
│  │ /api/zoho/projects/    │  │
│  │   [id]/tasks           │──┼────► Task fetching
│  │ /api/zoho/projects/    │  │
│  │   [id]/tasks/[id]/     │  │
│  │   timelogs             │──┼────► Time log creation
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ localStorage           │  │
│  │                        │  │
│  │ - zoho_credentials     │  │
│  │ - zoho_tokens          │  │
│  │ - user_projects        │  │
│  │ - zoho-checkpoints     │  │
│  │ - current-checkpoint   │  │
│  │ - logged-checkpoint-ids│  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

## Key Architectural Decisions

### 1. Client-Side State (localStorage)
All user data is stored in localStorage — no database. This keeps the architecture simple and avoids server-side user management. Trade-off: data is browser-specific and not shareable across devices.

### 2. API Routes as Thin Proxies
Next.js API routes act as proxies to the Zoho API. They:
- Receive auth credentials via custom headers (`x-zoho-access-token`, `x-zoho-portal-id`)
- Create a `ZohoClient` instance per request
- Forward to Zoho and return the response
- Exception: `/api/zoho/token` handles OAuth exchange server-side (keeps client_secret off the client)

### 3. Auto Token Refresh
The `zohoFetch` wrapper intercepts 401 responses, calls `/api/zoho/token` with the refresh_token, updates localStorage, dispatches a `zoho-token-refreshed` custom event, and retries the original request. This makes token expiry invisible to the user.

### 4. User-Configurable Portal (No Hardcoded Env)
In production, portal ID and OAuth credentials come from the user via the SetupWizard/Profile page, not from environment variables. Env vars serve as development-only fallbacks. This makes the app usable by anyone with a Zoho account.

### 5. Task Matching Algorithm (Client-Side)
Task matching runs entirely in the browser using multiple text similarity strategies:
- **Substring/phrase matching** — direct text containment
- **Stemmed Jaccard similarity** — word overlap after stemming
- **Token containment** — what fraction of description words appear in task name
- **Prefix matching** — matching beginnings of words
- **Self-assigned bonus** (+15 points) — tasks assigned to the current user
- **Recency bonus** (up to +10 points) — recently modified tasks ranked higher
- Top 50 matches shown, sorted by combined score

### 6. Checkpoint-Based Timer
Instead of one-shot timers per task, the app uses a continuous timer with checkpoints:
- Timer runs in the sidebar continuously
- User clicks to create checkpoints at natural break points
- Each checkpoint records start time, end time, and duration
- Descriptions can be added/edited at any time
- Logged checkpoints are tracked and visually marked

## Design Patterns

### Frontend Patterns
- **Context Providers**: `AuthContext` (auth state), `ThemeContext` (dark mode), `SidebarContext` (TailAdmin)
- **Custom Hooks**: `useProjects` (CRUD + localStorage), `useModal`, `useGoBack`
- **Wrapper Pattern**: `zohoFetch` wraps native fetch with auth header injection and auto-refresh
- **View Switching**: Main page toggles between dashboard view and task-matching view (no router)
- **localStorage as Database**: All state persisted to localStorage with JSON serialization

### Backend Patterns
- **Proxy Pattern**: API routes proxy to Zoho API, adding no business logic
- **Header-Based Auth**: Client sends credentials via headers, server creates `ZohoClient` per request
- **Stateless Routes**: No server-side state or sessions; everything comes from headers/request body
- **ZohoClient Class**: Encapsulates all Zoho API URL construction, auth headers, and error handling

### Data Flow
```
Timer Running → User Creates Checkpoint → Description Added →
"Match to Task" Clicked → TaskMatching View Opens →
Similarity Algorithm Scores All Tasks → User Selects Best Match →
Time Log POSTed to Zoho API → Checkpoint Marked as Logged
```

## Component Architecture

### Layout Hierarchy
```
RootLayout (ThemeProvider > SidebarProvider > AuthProvider)
  └── AdminLayout (minimal wrapper)
       └── MainPage
            ├── TimerSidebar (fixed left, w-64/72/96)
            └── Main Content Area
                 ├── Dashboard View
                 │    ├── ConnectionStatus
                 │    ├── SetupWizard (if not configured)
                 │    ├── StatsCards
                 │    ├── ProjectsOverview
                 │    └── TasksTable
                 └── TaskMatching View
                      └── TaskMatching (similarity results + log submission)
```

### Key Components
| Component | Purpose | State Source |
|-----------|---------|--------------|
| `TimerSidebar` | Timer, checkpoints, descriptions, logged status | localStorage |
| `TaskMatching` | Score tasks, display matches, submit time logs | Zoho API + localStorage |
| `ProjectsOverview` | Add/remove/toggle projects by ID | localStorage via `useProjects` |
| `TasksTable` | Browse tasks with status/priority/project filters | Zoho API via `dataProvider` |
| `SetupWizard` | 4-step onboarding (client ID, secret, portal, OAuth) | localStorage |
| `StatsCards` | Summary metrics (projects, tasks, hours) | Derived from local data |
| `ConnectionStatus` | Zoho connection state indicator | `AuthContext` |
| `DurationDisplay` | Live-updating duration for active timer | Props + interval |

### Component Naming Conventions
- **PascalCase** for all component names
- **Suffix indicates type**: `Sidebar`, `Table`, `Cards`, `Display`, `Overview`, `Wizard`, `Status`
- **Feature-descriptive names**: `TaskMatching` (not `TaskSelector`), `TimerSidebar` (not `Sidebar`)

## Configuration Architecture

### Development
```
.env.local → ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, etc.
```

### Production
```
SetupWizard/Profile Page → localStorage (zoho_credentials, zoho_tokens)
  → zohoFetch reads localStorage → sends x-zoho-* headers
  → API routes read headers → create ZohoClient → call Zoho API
```

### Fallback Strategy
Environment variables serve as development-only defaults. In production, user-provided values in localStorage always take precedence.

## Performance Patterns
- **localStorage Caching**: Projects and checkpoints cached locally
- **Client-Side Matching**: Task similarity runs in browser (no API call)
- **Lazy View Switching**: Dashboard and TaskMatching views render on demand
- **Auto-Refresh**: Token refresh happens transparently without page reload
- **Interval-Based Timer**: `setInterval` for live duration display updates

## Security Considerations
- **OAuth tokens in localStorage**: Standard browser security model; tokens are per-browser
- **Client secret in localStorage**: Necessary for token refresh from client; mitigated by HTTPS-only transmission
- **Header-based auth**: Credentials sent via HTTPS headers to API routes
- **No server-side persistence**: Backend is stateless — no user data stored server-side
- **Token format detection**: Automatically chooses `Bearer` vs `Zoho-oauthtoken` based on token prefix
