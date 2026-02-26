# Product Context: Zoho Hours Register

## Why This Project Exists
Zoho Projects' native time logging interface requires multiple clicks and context switches. This tool provides a dedicated, always-visible timer sidebar that makes time tracking frictionless. Instead of manually finding tasks and entering hours, users run a timer, write a description, and let the system match it to the correct task automatically.

## Problems Solved
- **Manual Time Entry**: Replaces tedious manual hour entry with a timer-based checkpoint system
- **Task Association**: Intelligent text similarity matching reduces the effort of finding the right task
- **Context Switching**: Dedicated dashboard eliminates switching between Zoho Projects and a separate time tracker
- **Lost Time**: Always-visible sidebar timer ensures no work goes untracked
- **Configuration Complexity**: Setup wizard and profile page make OAuth configuration accessible to non-developers

## How It Works (Current Implementation)
1. **Setup**: User completes 4-step setup wizard (client ID, client secret, portal ID, OAuth authorization)
2. **Timer**: Sidebar timer runs continuously; user clicks to create checkpoints at natural break points
3. **Descriptions**: Each checkpoint gets a description of what was worked on
4. **Projects**: User adds Zoho project IDs to track; tasks are fetched from Zoho API
5. **Task Matching**: When ready to log, the system scores all tasks against the checkpoint description using:
   - Substring/phrase matching
   - Stemmed Jaccard similarity
   - Token containment
   - Prefix matching
   - Self-assigned task bonus (+15 points)
   - Recency bonus (up to +10 points)
6. **Time Log**: User selects the best match and submits; time log is POSTed directly to Zoho Projects API
7. **Tracking**: Logged checkpoints are marked with green highlighting and tracked via localStorage

## User Experience
- **Timer Sidebar**: Fixed left panel (w-64/72/96 responsive) with checkpoint list, descriptions, and logged status
- **Main Content**: Switches between dashboard view (stats, projects, tasks) and task matching view
- **Dark Mode**: Full dark mode support via theme toggle
- **Connection Status**: Visual indicator showing Zoho API connection state (connected/disconnected/expired)
- **Auto Token Refresh**: Seamless — expired tokens are refreshed automatically on 401 responses

## Target Users
- Developers and team members at Dengun who use Zoho Projects for time tracking
- Anyone needing a faster way to log hours against Zoho Projects tasks
