# Project Brief: Zoho Hours Register

## Overview
This project aims to build a web application for efficient time tracking and logging hours specifically for Zoho projects and tasks. The application will integrate with Zoho's API to fetch project tasks, provide a dashboard interface using TailAdmin library, and include smart timer functionality with automatic task matching.

## Core Requirements
- **Zoho API Integration**: Direct API token authentication for accessing Zoho projects and tasks
- **Timer Functionality**: Sidebar-based timer that can be started for any activity, with pending logs that persist until confirmed
- **Task Matching**: Intelligent matching of user-provided descriptions to appropriate Zoho project tasks when confirming logs
- **Dashboard UI**: Clean, responsive dashboard built with TailAdmin library for managing projects
- **Dual Content Areas**:
  - Sidebar: Timer controls and pending log management
  - Main content: Project overview or detailed task lists for selected projects

## Success Criteria
- Users can easily start/stop timers and log time against Zoho tasks
- Accurate task matching reduces manual selection overhead
- Intuitive dashboard experience for project and time management
- Reliable Zoho API integration with proper error handling
- Simple, token-based access to Zoho data
- Responsive design that works across devices

## Scope Limitations
- Initial release focuses on time logging; future versions may include reporting features
- Single API token authentication (no user management)
- Desktop-first design with mobile optimization
