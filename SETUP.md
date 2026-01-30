# GitHub OAuth Setup Guide

This project uses a centralized OAuth proxy at `oauth.neevs.io` for GitHub authentication.

## For This Project (capstone.neevs.io)

### 1. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Duke Capstone
   - **Homepage URL**: `https://capstone.neevs.io`
   - **Authorization callback URL**: `https://oauth.neevs.io/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** → copy the **Client Secret**

### 2. Configure OAuth Proxy

Add your client credentials to the OAuth proxy:

```bash
cd ~/Documents/GitHub/agentivo/oauth-proxy

# Add to .env file (or create if doesn't exist)
echo "OAUTH_SECRET_<YOUR_CLIENT_ID>=<YOUR_CLIENT_SECRET>" >> .env

# Restart the proxy
# (If running via tunnel, it should auto-restart)
```

### 3. Deploy Site

```bash
git add github-auth.js index.html
git commit -m "Add GitHub OAuth authentication"
git push origin main
```

### 4. Test

Visit https://capstone.neevs.io - you should be redirected to GitHub for authentication.

## Adding OAuth to Other Projects

### Quick Start (3 steps)

1. **Include the library** (with SRI for security)
```html
<script
  src="https://oauth.neevs.io/github-auth.js"
  integrity="sha384-xjyIjlLvlDtUo/qI+yzJfTB6+jl9A7tHTRaGO9CwUa2C9llsA7A5pFDsO3ATKKdu"
  crossorigin="anonymous">
</script>
```

2. **Initialize**
```html
<script>
  GitHubAuth.init({
    onLogin: (user) => {
      console.log('Logged in as:', user.login);
      // Show your protected content
    }
  });
</script>
```

3. **Create OAuth app + add to proxy** (same as steps 1-2 above, but with your domain)

### Configuration Options

```javascript
GitHubAuth.init({
  clientId: 'xxx',              // Optional: auto-detects from proxy
  allowedUsers: ['username'],   // Optional: whitelist specific users
  autoRedirect: true,           // Auto redirect to login (default: true)
  onLogin: (user) => {},        // Called when user authenticates
  onLogout: () => {}            // Called when user logs out
});
```

### API

```javascript
// Check if authenticated
GitHubAuth.isAuthenticated()  // returns boolean

// Get current user
GitHubAuth.getUser()  // returns user object or null

// Get access token
GitHubAuth.getToken()  // returns token string or null

// Manual login/logout
GitHubAuth.login()
GitHubAuth.logout()
```

## Architecture

```
Your Site (capstone.neevs.io)
    ↓
  github-auth.js
    ↓
  oauth.neevs.io (proxy)
    ↓
  GitHub OAuth
```

## Architecture

**Branch Strategy:**
- `main` - Private branch with protected content in `/content/`
- `gh-pages` - Public branch with only shell (index.html, CNAME)

**Library Dependency:**
- `github-auth.js` loaded from `oauth.neevs.io` (centralized)
- Protected by SRI (Subresource Integrity) hash
- Update SRI when library changes:
  ```bash
  curl https://oauth.neevs.io/github-auth.js | \
    openssl dgst -sha384 -binary | openssl base64 -A
  ```

## Security Notes

- Repository is private - content only accessible via GitHub API
- Client secrets stored server-side in OAuth proxy
- OAuth tokens scoped to `read:user repo` for API access
- Content fetched from private repo, not served as static files
- Tokens validated against GitHub API on each page load
- SRI hash prevents library tampering
