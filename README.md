# Playground

An experimental app platform powered by GitHub. Build, iterate, and deploy apps rapidly with GitHub OAuth authentication and API-driven content delivery.

## Architecture

React-based launcher with lazy-loaded apps. All apps are stored in GitHub and loaded dynamically via the Contents API.

## Constraints

- 5,000 API requests/hour per user
- Static files only (no backend)
- Designed for 1-10 users
- Not suitable for public or high-traffic applications

## Performance

First load: 1-2s. Cached load: 100-200ms.

localStorage cache (5min TTL) reduces API usage by 90%.

## Debug

```javascript
analytics.getStats()
errorTracker.getErrors()
repo.clearCache()
```
