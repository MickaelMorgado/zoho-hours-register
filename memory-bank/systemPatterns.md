# System Patterns: Zoho Hours Register

## System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │ Vercel Functions│    │   Zoho API      │
│   (Vercel)      │◄──►│   (Serverless)  │◄──►│   (External)    │
│                 │    │                 │    │                 │
│ - Timer UI      │    │ - Auth Service  │    │ - Projects      │
│ - Dashboard     │    │ - Data Sync     │    │ - Tasks         │
│ - Log Manager   │    │ - Cache Layer   │    │ - Time Logs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (Vercel PG)   │
                       │                 │
                       │ - User Sessions │
                       │ - Pending Logs  │
                       │ - Cache Data    │
                       └─────────────────┘
```

## Key Technical Decisions
- **Monolithic Frontend**: Single React app for simplicity, with clear component boundaries
- **Serverless API Proxy**: Vercel functions act as lightweight proxy to Zoho API
- **Local-First Timer**: Timer state managed client-side with local storage for offline capability
- **Optimistic UI**: UI updates immediately, with background sync for reliability
- **Token-Based Auth**: Simple API token configuration, no complex user management
- **User-Friendly Configuration**: Portal ID and OAuth settings configured via UI for non-developer efficiency

## Design Patterns
### Frontend Patterns
- **Container/Presentational**: Separate logic from presentation components
- **Custom Hooks**: Encapsulate timer logic, API calls, and state management
- **Context Providers**: Global state for authentication, current project, and pending logs
- **Compound Components**: Timer component with start/stop/play controls
- **Profile-Based Configuration**: Critical settings (portal ID, OAuth tokens) managed via user profile UI

### Backend Patterns (Serverless)
- **Function-per-Endpoint**: Each API endpoint as separate Vercel function
- **Middleware Chain**: Authentication, rate limiting, error handling per function
- **Repository Pattern**: Abstract data access layer for database operations
- **Service Layer**: Business logic encapsulated in utility modules
- **Stateless Design**: No server state, all data persisted to database
- **Header-Based Config**: API routes read user configuration from request headers (non-developer friendly)

### Configuration Management
- **Environment Variables**: Development/testing configuration only
- **User Profile Settings**: Production configuration via UI (portal ID, OAuth tokens)
- **LocalStorage Persistence**: User settings persist across sessions
- **Header Propagation**: Frontend sends user settings as headers to backend
- **Fallback Strategy**: Environment variables as development fallbacks

## Component Naming Conventions
### General Rules
- **PascalCase**: All component names use PascalCase (e.g., `StatsCards`, `TaskMatching`)
- **Descriptive Names**: Component names should clearly indicate their purpose and functionality
- **Component Type Suffixes**: Use descriptive suffixes to indicate component type when helpful:
  - `Panel`: Main content areas with complex functionality (e.g., `TimerPanel`)
  - `Sidebar`: Compact side panel components (e.g., `TimerSidebar`)
  - `Table`: Data display in table format (e.g., `TasksTable`)
  - `Cards`: Statistics or summary information in card layout (e.g., `StatsCards`)
  - `Display`: Simple display components (e.g., `DurationDisplay`)
  - `Overview`: Summary views of collections (e.g., `ProjectsOverview`)
- **Feature Prefixes**: For complex features, consider feature-based naming to group related components
- **Avoid Generic Names**: Use specific names like `TaskMatching` instead of `TaskSelector` to indicate unique functionality

### Current Dashboard Components
- **StatsCards**: Displays key statistics (active projects, completed tasks, hours logged, total projects) in card format
- **TimerPanel**: Main panel for managing time tracking timers with detailed controls and history
- **TimerSidebar**: Compact sidebar view of timers with quick actions and status indicators
- **TaskMatching**: Interface for displaying task matches based on checkpoint descriptions using similarity algorithms (note: currently read-only, no save functionality implemented)
- **TasksTable**: Tabular display of project tasks with status, priority, and assignment information
- **DurationDisplay**: Real-time duration display component for active timers
- **ProjectsOverview**: Comprehensive project dashboard with overview metrics and navigation

### Proposed Naming Improvements (Future Refactoring)
- Consider renaming `Checkpoints*` components to `Timer*` for clearer indication of time tracking functionality
- Evaluate `TaskMatching` → `TaskMatcher` for more conventional naming
- Assess `ProjectsOverview` → `ProjectDashboard` for consistency with dashboard theme
- **Critical**: Rename save button from "Save time log and match to tasks" to "Match to Task" since clicking navigates to task selection view (not direct saving)

## Component Relationships
### Core Components
- **App**: Root component with routing and global context
- **Dashboard**: Main layout with sidebar and content area
- **Sidebar**: Timer controls and pending logs list
- **MainDashboard**: Main dashboard page component that switches between views:
  - Dashboard view: Statistics, project overview, and task list display
  - Task matching view: Intelligent task matching interface for checkpoints
- **TimerModal**: Description input and task matching interface

### Data Flow
1. App initializes → Load API token from environment
2. App fetches projects → Cached locally or via Vercel function
3. Timer started → State managed locally in browser storage
4. Timer stopped → Pending log created in local storage
5. Log confirmed → Description matched to tasks → Synced to Zoho via API

## Critical Implementation Paths
### Initialization Flow
```
App Load → Check Environment Config → Validate API Token → Load Cached Data
```

### Timer to Log Flow
```
Start Timer → Local State Update → Stop Timer → Create Pending Log → 
User Input Description → Task Matching → Confirm Log → Sync to Zoho
```

### Data Synchronization
```
Frontend Request → Check Cache → API Call to Zoho → Update Cache → 
Return Data → Update UI
```

### User Configuration Flow (Non-Developer Friendly)
```
Profile Page → User enters portal ID/OAuth settings → Save to localStorage → 
useProjects hook reads localStorage → Sends x-zoho-portal-id header → 
API route uses header instead of env vars → Zoho API call with user config
```

## Performance Patterns
- **Lazy Loading**: Components and routes loaded on demand
- **Memoization**: Expensive calculations cached (task matching, API responses)
- **Debouncing**: API calls throttled for search and filtering
- **Background Sync**: Non-blocking data synchronization

## Configuration Architecture
### Development vs Production
- **Development**: Environment variables for quick testing
- **Production**: User profile settings for accessibility
- **Fallback Strategy**: Environment variables as backup for development
- **Header-Based API**: All user-specific config passed via headers

### Security Considerations
- **Client-Side Storage**: OAuth tokens stored in localStorage (browser security)
- **Header Transmission**: Sensitive data sent via HTTPS headers only
- **No Server Storage**: Backend remains stateless, no persistent user data
- **Token Refresh**: OAuth flow handles token expiration automatically
