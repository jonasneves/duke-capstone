# Duke Capstone - Secure Prototype Gallery

A private prototype gallery powered by GitHub Pages and GitHub API. All content is protected behind GitHub OAuth with repository-level access control.

## Architecture

```
gh-pages Branch (Public - 1.5KB auth shell)
    ↓ (GitHub OAuth)
main Branch (Private Repository)
    ↓ (GitHub Contents API)
Apps loaded dynamically via authenticated requests
```

The public branch contains only an authentication shell. After login, all content is fetched from the private repository using the user's GitHub token.

## Features

**Security**
- Repository-level access control enforced by GitHub
- OAuth authentication required
- All content fetched with user tokens

**Performance**
- 5-minute localStorage cache (reduces API calls by 90%)
- Lazy loading and preloading
- Service Worker for offline support
- Token injection eliminates re-authentication in apps

**Developer Experience**
- Built-in CMS for content management
- Version compatibility checking
- Error tracking and analytics
- Keyboard shortcuts (ESC to close, Ctrl+R to refresh)

## Limitations

**API Rate Limits**
- 5,000 requests/hour per authenticated user
- Caching reduces typical usage to ~50 requests/hour
- Not suitable for high-traffic or public applications

**No Backend**
- Static files only, no server-side execution
- Use GitHub Actions for scheduled tasks if needed
- JSON files serve as data storage

**Scalability**
- Designed for 1-10 users
- Personal and team prototypes only

## Performance

- First load: 1-2 seconds
- Cached load: 100-200ms

## Monitoring

```javascript
analytics.getStats()        // View usage statistics
errorTracker.getErrors()    // View error logs
repo.clearCache()           // Clear localStorage cache
```

## Use Cases

Suitable for personal prototypes, team tools, educational projects, and portfolios with access control.

Not suitable for public production applications, high-traffic services, or apps requiring backend infrastructure.

## License

MIT
