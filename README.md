# Zoho Hours Register

A time tracking dashboard for logging hours against Zoho Projects tasks. Features a timer-based checkpoint system with intelligent task matching that submits time logs directly to the Zoho Projects API.

Built with Next.js 16, React 18, TypeScript, and Tailwind CSS v4 on a TailAdmin dashboard base.

## Features

- **Timer Sidebar** — Always-visible timer with checkpoint creation and description editing
- **Task Matching** — Multi-strategy text similarity algorithm scores tasks against checkpoint descriptions
- **Time Log Submission** — Direct POST to Zoho Projects API with date, hours, minutes, and time range
- **OAuth Integration** — Zoho OAuth 2.0 with automatic token refresh on 401 responses
- **Setup Wizard** — 4-step onboarding for OAuth credentials and portal configuration
- **Project Management** — Add/remove/toggle Zoho projects by ID
- **Task Browsing** — Filterable task table with status, priority, and project filters
- **Dark Mode** — Full dark/light theme support
- **Connection Status** — Visual Zoho API connection indicator

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- A Zoho Projects account with API access
- Zoho OAuth client credentials (create at [Zoho API Console](https://api-console.zoho.com/))

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first visit, the Setup Wizard will guide you through configuring your Zoho OAuth credentials and portal ID.

### Environment Variables (optional, for development)

Create `.env.local` with:

```
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
```

In production, all configuration is done via the Setup Wizard or Settings page — no env vars needed.

### Build

```bash
npm run build
npm run start
```

## How It Works

1. **Setup** — Complete the 4-step wizard (client ID, client secret, portal ID, OAuth authorization)
2. **Add Projects** — Enter Zoho project IDs in the Projects Overview section
3. **Run Timer** — Timer runs in the sidebar; click to create checkpoints at break points
4. **Add Descriptions** — Describe what you worked on for each checkpoint
5. **Match to Tasks** — Click "Match to Task" and the system scores all tasks using text similarity
6. **Submit Log** — Select the best match and submit; time log is POSTed to Zoho Projects API

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS v4 |
| UI Base | TailAdmin dashboard template |
| Icons | lucide-react |
| State | localStorage (no database) |
| API | Next.js API routes (Zoho proxy) |
| Auth | Zoho OAuth 2.0 with auto-refresh |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── (admin)/              # Main app routes
│   │   ├── page.tsx          # Dashboard (timer + task matching)
│   │   └── profile/page.tsx  # Settings/credentials page
│   └── api/zoho/             # Zoho API proxy routes
├── components/dashboard/     # Dashboard components
├── context/                  # Auth, Theme, Sidebar contexts
├── hooks/                    # useProjects, useModal, useGoBack
├── lib/                      # ZohoClient, zohoFetch, dataProvider
└── types/                    # TypeScript interfaces
```

## Deployment

Configured for Vercel deployment. See `vercel.json` for configuration.

```bash
vercel
```

## License

MIT
