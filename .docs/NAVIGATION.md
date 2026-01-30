# Navigation Patterns

## User Menu

The user menu (top-right) provides global navigation:

- **Gallery** - Returns to app launcher
- **Refresh** - Reloads the page
- **Settings** - Opens settings page
- **App-specific items** - Custom actions per app
- **Clear Cache** - Clears repository cache
- **Logout** - Signs out of GitHub

## App Headers

Each app's header (logo/title) is clickable and resets the app to its initial state:

### Chat App
- Click "AI Chat" → Clears chat history
- Provides fresh conversation start

### Todo App
- Click logo/title → Shows all tasks
- Resets filter to "all"

### Dashboard
- Click title → Refreshes statistics
- Reloads data from repository

### Other Apps
- Clicking headers provides app-specific reset behavior
- Generally returns to default/clean state

## Naming Conventions

- **Gallery** - The main app launcher (not "Home")
- **App Home** - Clicking app logo/title (resets app state)
- **Back buttons** - Navigate to gallery (where applicable)
