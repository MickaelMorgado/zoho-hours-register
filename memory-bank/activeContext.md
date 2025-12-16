# Active Context: Zoho Hours Register

## Current Work Focus
- Zoho API integration implementation
- Authentication and API client setup
- Project and task data fetching
- Integration with existing dashboard UI

## Recent Changes
- Created comprehensive memory bank with core documentation files
- Established project scope and technical approach
- Defined system architecture and key design patterns
- Updated progress to reflect start of Zoho integration phase
- **FIXED**: Corrected API endpoint to use `https://projectsapi.zoho.com/api/v3` (was using `restapi`)
- **FIXED**: Portal ID confirmed as `632970450` (user's actual portal, not documentation example)
- **REFACTORED**: `useProjects` hook now uses `ZohoClient` directly instead of Next.js API routes

## Next Steps
- Integrate Zoho service into dashboard components
- Replace dummy data usage with real Zoho API calls
- Update data provider to use Zoho service
- Test API integration with existing UI components
- Add proper error handling and loading states

## Active Decisions
- **Tech Stack Confirmed**: React + TypeScript frontend with Vite build system
- **Deployment**: Vercel for hosting and serverless functions
- **UI Framework**: TailAdmin React version with Tailwind CSS
- **Database**: Minimal local storage, Vercel functions for API calls
- **Authentication**: Direct Zoho API token via environment configuration

## Important Patterns & Preferences
- **Component Naming**: PascalCase for components, camelCase for hooks/functions
- **File Structure**: Feature-based organization with shared utilities
- **State Management**: React Context for global state, local state for component-specific
- **API Design**: Direct Zoho API calls via ZohoClient (not through Next.js API routes)
- **Git Commits**: Conventional commits with type(scope): description format

## Project Insights
- **Simplified Architecture**: API token approach eliminates user management complexity
- **Vercel Alignment**: Perfect for serverless API proxy to Zoho
- **Offline-First**: Local storage for timers ensures usability without constant connectivity
- **User Experience Priority**: Smart defaults and minimal steps for time logging
- **Task Matching Strategy**: Percentage-based algorithm to show potential task matches with accuracy scores, avoiding AI costs while providing intelligent suggestions

## Current Challenges
- Zoho API documentation research for correct endpoints and authentication
- Task matching algorithm design for optimal accuracy
- Vercel function cold start optimization
- Balancing offline functionality with API synchronization

## Open Questions
- Specific Zoho API endpoints for projects, tasks, and time logging
- TailAdmin version compatibility with React 18 and TypeScript
- Task matching algorithm implementation details (string similarity metrics, threshold settings)
- Mobile responsiveness breakpoints and layout adjustments

## Important Configuration Discoveries

### Zoho API Configuration
- **Correct Base URL**: `https://projectsapi.zoho.com/restapi` (not `api/v3`)
- **Portal ID**: `632970450` (user's actual portal ID, not documentation examples like `739121528`)
- **Profile Settings**: Portal ID and OAuth configuration managed via `/profile` page for non-developer efficiency
- **Header-Based Config**: Frontend sends user config via `x-zoho-portal-id` and `x-zoho-access-token` headers

### API Endpoint Structure
```
https://projectsapi.zoho.com/restapi/portal/{portalId}/projects/
https://projectsapi.zoho.com/restapi/portal/{portalId}/tasks/
https://projectsapi.zoho.com/restapi/portal/{portalId}/timelogs/
```

### User Configuration Flow
1. User visits `/profile` page
2. Enters portal ID (`632970450`) and OAuth credentials
3. Settings saved to `localStorage` as `zoho_credentials`
4. `useProjects` hook reads localStorage and creates `ZohoClient` directly
5. Direct API calls to Zoho - no Next.js API route dependency

## Architectural Improvements

### Before (Problematic):
```typescript
// Going through Next.js API route - potential localhost issues
const response = await fetch('/api/zoho/projects', { headers });
```

### After (Direct & Clean):
```typescript
// Direct Zoho API calls - no localhost dependency
const zohoClient = new ZohoClient({
  portalName: credentials.portalId,
  apiToken: tokens.access_token,
  clientId: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_ZOHO_CLIENT_SECRET,
});

const zohoProjects = await zohoClient.getProjects();
```

### Benefits of Direct API Calls:
- **No localhost dependency** - bypasses Next.js API routes entirely
- **Cleaner architecture** - fewer layers of abstraction
- **Better performance** - direct API calls without HTTP overhead
- **Simplified error handling** - direct control over API responses

### Component Architecture:
- **useProjects Hook**: Uses `ZohoClient` directly for project fetching
- **ZohoClient**: Handles all Zoho API communication
- **Profile Settings**: UI for user configuration (portal ID, OAuth tokens)
- **localStorage**: Persistence layer for user credentials
