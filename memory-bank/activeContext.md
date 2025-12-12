# Active Context: Zoho Hours Register

## Current Work Focus
- Initial project setup and structure establishment
- Memory bank creation and documentation foundation
- Technology stack selection and architecture planning

## Recent Changes
- Created comprehensive memory bank with core documentation files
- Established project scope and technical approach
- Defined system architecture and key design patterns

## Next Steps
- Set up React frontend with Vite build system
- Configure TailAdmin library integration
- Implement basic project structure (frontend/backend separation)
- Create initial UI layout with sidebar and main content areas

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
- **API Design**: Serverless functions with consistent error response format
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
