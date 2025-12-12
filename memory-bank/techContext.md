# Tech Context: Zoho Hours Register

## Technology Stack
- **Frontend**: React 18 with TypeScript for type safety
- **UI Framework**: TailAdmin (React version) with Tailwind CSS for styling
- **Backend/Deployment**: Vercel for serverless functions and hosting
- **Database**: Vercel Postgres or SQLite for development (evaluate based on needs)
- **Authentication**: Direct Zoho API token configuration (environment variables)
- **API Client**: Axios for HTTP requests to Zoho API
- **State Management**: React Context API with hooks
- **Timer Logic**: JavaScript Date API with local storage persistence
- **Task Matching**: Percentage-based similarity algorithm for task description matching

## Development Setup
- **Package Manager**: npm for dependency management
- **Build Tool**: Vite for fast development and optimized production builds
- **Deployment**: Vercel for frontend hosting and serverless functions
- **Linting**: ESLint with React and TypeScript rules
- **Testing**: Jest for unit tests, React Testing Library for component tests
- **Version Control**: Git with conventional commit messages
- **Environment**: Node.js 18+, development on macOS

## Technical Constraints
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **API Limits**: Respect Zoho API rate limits (typically 1000 requests/hour)
- **Vercel Limits**: Consider function execution time and cold start implications
- **Offline Capability**: Timer functionality must work without internet connection
- **Data Persistence**: Pending logs stored locally, sync when online
- **Security**: API tokens stored securely in environment variables

## Dependencies
### Frontend
- `react`, `react-dom`
- `@types/react`, `@types/react-dom`
- `tailwindcss`, `autoprefixer`, `postcss`
- `axios`
- `react-router-dom` (for navigation)
- `lucide-react` (for icons)

### Backend (Vercel Functions)
- Serverless functions for API endpoints
- `zoho-api` or custom OAuth implementation
- Database client (Vercel Postgres or alternative)

## Tool Usage Patterns
- **Git Workflow**: Feature branches, pull requests, code reviews
- **Code Style**: Functional components with hooks, consistent naming
- **Error Handling**: Try-catch blocks, user-friendly error messages
- **API Design**: RESTful endpoints with JSON responses
- **Performance**: Lazy loading, memoization for expensive operations
