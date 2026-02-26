# Project Brief: Zoho Hours Register

## Overview
A web application for efficient time tracking and logging hours against Zoho Projects tasks. Built on the TailAdmin Next.js dashboard template, it provides a timer-based checkpoint system with intelligent task matching that submits time logs directly to the Zoho Projects API.

## Core Requirements
- **Zoho OAuth Integration**: OAuth 2.0 authentication with automatic token refresh for accessing Zoho Projects API
- **Timer/Checkpoint System**: Sidebar-based timer that creates checkpoints with descriptions, persisted to localStorage
- **Task Matching**: Multi-strategy text similarity algorithm that scores and ranks Zoho tasks against checkpoint descriptions
- **Time Log Submission**: Direct POST to Zoho Projects API with date, hours, minutes, notes, and time range
- **Dashboard UI**: Clean dashboard built on TailAdmin with project management, task browsing, and stats
- **User Configuration**: Setup wizard and profile page for OAuth credentials and portal configuration (no hardcoded env vars needed in production)

## Success Criteria
- Users can start/stop timers and create checkpoints with descriptions
- Checkpoints can be matched to Zoho tasks using intelligent similarity scoring
- Time logs are submitted directly to Zoho Projects API
- OAuth tokens refresh automatically on expiry (401 interception)
- Works with any Zoho Projects portal (user-configurable portal ID)
- Responsive design with dark mode support

## Scope
- **In scope**: Timer, checkpoints, task matching, time log submission, project/task browsing, OAuth flow
- **Out of scope (for now)**: Reporting/analytics, time log editing/deletion via UI, team management, mobile app
- **Auth model**: Single-user, client-side localStorage credentials (no server-side user management)
- **Deployment**: Vercel (Next.js + serverless API routes)
