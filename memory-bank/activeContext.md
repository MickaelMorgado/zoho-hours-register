# Active Context: Zoho Hours Register

## Current Work Focus
The core application is functional with timer, checkpoints, task matching, and time log submission all working. The app is in a usable state for daily time tracking against Zoho Projects.

## Recent Changes (Latest)
- Full timer/checkpoint system implemented with localStorage persistence
- Zoho OAuth flow with automatic token refresh (401 interception in `zohoFetch`)
- 4-step SetupWizard for onboarding new users
- Profile/Settings page for managing credentials
- Task matching with multi-strategy similarity scoring
- Time log submission to Zoho Projects API
- Connection status indicator component
- Dark mode support
- Project management (add by ID, toggle active, remove)

## What's Working
- Timer sidebar with checkpoint creation, duration tracking, description editing
- Zoho OAuth token exchange and automatic refresh
- AuthContext with connection status detection (loading/connected/disconnected/expired)
- Setup Wizard (4-step onboarding flow)
- Settings/Profile page for credential management
- Project management (add by ID, toggle active, remove, clear all)
- Task fetching from active projects via Zoho API
- Tasks table with status/priority/project filters
- Task matching with intelligent similarity scoring (top 50 matches)
- Time log creation (POST to Zoho API)
- Checkpoint logged status tracking (green highlighting)
- Dark mode toggle
- Connection status indicator

## What Needs Work
- **StatsCards**: Shows hardcoded/zero values — not populated from real API data
- **Unused TailAdmin components**: Template boilerplate pages still present (calendar, charts, forms, etc.)
- **No time log history**: Can't view/edit/delete previously submitted time logs
- **No pagination**: Task lists show all results (could be slow for large projects)
- **No reporting**: No analytics or time summaries
- **ZohoClient methods unused**: `getTimeLogs`, `updateTimeLog`, `deleteTimeLog` exist but have no API routes
- **No tests**: No unit or integration tests
- **README**: Still contains TailAdmin template boilerplate

## Active Decisions
- **No database**: localStorage is sufficient for single-user, single-browser use
- **No TailAdmin layout**: Admin layout is custom (no AppSidebar/AppHeader from template)
- **Direct API calls**: `zohoFetch` goes through Next.js API routes (not direct from browser to Zoho, due to CORS)
- **Client-side matching**: Task similarity runs in browser to avoid AI/API costs

## Important Patterns & Preferences
- **Component Naming**: PascalCase, descriptive suffixes (`Sidebar`, `Table`, `Cards`, etc.)
- **State**: localStorage for persistence, React state for UI
- **Auth Headers**: `x-zoho-access-token`, `x-zoho-portal-id` sent to API routes
- **Token Format**: `1000.*` tokens use `Bearer`, others use `Zoho-oauthtoken`
- **Git Commits**: Conventional commits (`feat:`, `fix:`, `docs:`)

## Zoho API Configuration
- **Base URL**: `https://projectsapi.zoho.com/restapi/portal/{portalId}/`
- **Portal ID**: `632970450`
- **Token Endpoint**: `https://accounts.zoho.com/oauth/v2/token`
- **API Routes**: `/api/zoho/token`, `/api/zoho/projects`, `/api/zoho/projects/[id]/tasks`, `/api/zoho/projects/[id]/tasks/[id]/timelogs`

## Git History (7 commits)
```
27082e4 Add Zoho Projects API integration
ffe8808 feat: unify floating badge and task matching view with primary brand colors
be4f2e2 Fix timer naming consistency and preserve custom descriptions
73c93ef fix: fix
74ed612 fix: fix
83b4ff3 fix: vercel setup
79f8f6e first commit
```
