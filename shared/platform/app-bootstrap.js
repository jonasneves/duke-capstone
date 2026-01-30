/**
 * App Bootstrap - Standardized initialization for apps
 * Provides a clean API for apps to access launcher functionality
 */

async function getLauncher() {
  const token = window.INJECTED_TOKEN || await authenticateUser();
  const user = window.INJECTED_USER || window.GitHubAuth.getUser();
  const repo = window.PARENT_REPO || await loadRepo(token);

  return {
    user,
    repo,
    token,
    close: () => window.parent.postMessage('close-app', '*'),
    reload: () => location.reload()
  };
}

async function authenticateUser() {
  return new Promise((resolve) => {
    window.GitHubAuth.init({
      autoRedirect: true,
      onLogin: () => resolve(window.GitHubAuth.getToken())
    });
  });
}

async function loadRepo(token) {
  const apiUrl = 'https://api.github.com/repos/jonasneves/duke-capstone/contents/shared/core/api.js';
  const response = await fetch(apiUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  eval(decodeURIComponent(escape(atob(data.content))));
  return initRepo(token);
}

window.getLauncher = getLauncher;
