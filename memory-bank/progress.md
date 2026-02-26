# Progress: Zoho Hours Register

## What Works
- **Timer/Checkpoint System**: Full timer with checkpoint creation, duration tracking, description editing, localStorage persistence
- **Zoho OAuth Flow**: Token exchange, automatic refresh on 401, connection status detection
- **Setup Wizard**: 4-step onboarding (client ID, client secret, portal ID, OAuth authorization)
- **Profile/Settings**: Credential management page for portal and OAuth configuration
- **Project Management**: Add projects by ID, toggle active/inactive, remove, clear all (localStorage-backed)
- **Task Fetching**: Tasks loaded from Zoho API for active projects
- **Task Browsing**: Filterable task table with status, priority, and project filters
- **Task Matching**: Multi-strategy text similarity scoring (substring, Jaccard, token containment, prefix, self-assigned bonus, recency bonus)
- **Time Log Submission**: POST to Zoho Projects API with date, hours, minutes, notes, start/end times
- **Checkpoint Tracking**: Logged checkpoints marked with green highlighting, tracked via localStorage
- **Dark Mode**: Full dark/light theme support
- **Connection Status**: Visual indicator for Zoho API connection state
- **Deployment**: Vercel configuration ready

## What's Left to Build

### High Priority
- [ ] Populate StatsCards with real data from Zoho API (currently shows zeros)
- [ ] Add time log history view (view/edit/delete submitted logs)
- [ ] Expose `getTimeLogs`, `updateTimeLog`, `deleteTimeLog` via API routes
- [ ] Write proper README (replace TailAdmin boilerplate)
- [ ] Add basic error handling for network failures during log submission

### Medium Priority
- [ ] Add pagination for task lists (performance with large projects)
- [ ] Clean up unused TailAdmin template pages (calendar, charts, forms, alerts, etc.)
- [ ] Remove unused TailAdmin layout components (`AppSidebar`, `AppHeader`)
- [ ] Add basic reporting/time summaries
- [ ] Improve task matching accuracy based on usage feedback

### Low Priority
- [ ] Add unit/integration tests
- [ ] Mobile responsiveness improvements
- [ ] Offline mode for timer (works but could be more robust)
- [ ] Multi-device sync (would need server-side storage)
- [ ] Bulk time log submission for multiple checkpoints

## Current Status
- **Stage**: MVP functional — daily use for time tracking
- **Readiness**: ~70% — core workflow complete, needs polish and secondary features
- **Blockers**: None — app is usable as-is
- **Commits**: 7 total

## Milestones
- [x] Project scaffolding (Next.js + TailAdmin template)
- [x] Vercel deployment configuration
- [x] Timer/checkpoint sidebar implementation
- [x] Zoho OAuth integration (token exchange + auto-refresh)
- [x] Setup wizard for user onboarding
- [x] Project management (add/remove/toggle)
- [x] Task fetching from Zoho API
- [x] Task matching with similarity scoring
- [x] Time log submission to Zoho
- [x] Dark mode support
- [x] Connection status indicator
- [ ] StatsCards with real data
- [ ] Time log history (CRUD)
- [ ] Template cleanup
- [ ] Tests
- [ ] Reporting features

## Evolution of Decisions
- **Started with**: Direct API token auth (env vars only) -> **Evolved to**: OAuth flow with user-configurable credentials via UI
- **Started with**: API routes as business logic layer -> **Evolved to**: Thin proxy routes with `ZohoClient` doing the work
- **Started with**: TailAdmin full layout -> **Evolved to**: Custom minimal layout (no sidebar/header from template)
- **Considered**: AI-based task matching -> **Chose**: Client-side text similarity (no API costs, fast enough)
- **Considered**: Database for state -> **Chose**: localStorage (single-user, simpler architecture)
