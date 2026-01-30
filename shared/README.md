# Shared Framework

This directory contains the core framework code that powers the launcher and provides utilities for apps.

## Structure

```
shared/
├── core/           # Core launcher framework (required)
│   ├── api.js      # GitHub API client
│   └── launcher.js # App loading, iframe management, UI
├── platform/       # Optional platform features
│   ├── monitoring.js      # Error tracking and analytics
│   └── app-bootstrap.js   # Standardized app initialization
└── styles/         # Shared stylesheets
    └── common.css
```

## For App Developers

Apps should use the standardized bootstrap:

```javascript
import '/shared/platform/app-bootstrap.js';

const { user, repo, token, close } = await getLauncher();

// Your app logic here
document.getElementById('back-btn').onclick = close;
```

## Core vs Platform

- **core/** - Essential framework code that makes the launcher work
- **platform/** - Optional features like analytics, error tracking
