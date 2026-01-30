/**
 * GitHub Repository API Abstraction with Caching
 */

class GitHubRepo {
  constructor(owner, repo, token) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
    this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    this.cacheTimeout = 300000; // 5 minutes
  }

  getCacheKey(path) {
    return `gh_${this.owner}_${this.repo}_${path}`;
  }

  getFromCache(path) {
    try {
      const cacheKey = this.getCacheKey(path);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const { content, sha, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > this.cacheTimeout) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return { content, sha, path };
    } catch (e) {
      return null;
    }
  }

  setCache(path, data) {
    try {
      const cacheKey = this.getCacheKey(path);
      localStorage.setItem(cacheKey, JSON.stringify({
        content: data.content,
        sha: data.sha,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  }

  clearCache() {
    const prefix = `gh_${this.owner}_${this.repo}_`;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) localStorage.removeItem(key);
    });
  }

  async getFile(path) {
    const cached = this.getFromCache(path);
    if (cached) return cached;

    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }

    const data = await response.json();
    const result = {
      content: atob(data.content),
      sha: data.sha,
      path: data.path,
      name: data.name,
      size: data.size
    };

    this.setCache(path, result);
    return result;
  }

  async updateFile(path, content, sha, message) {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message || `Update ${path}`,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: sha
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${path}: ${response.statusText}`);
    }

    localStorage.removeItem(this.getCacheKey(path));
    return response.json();
  }

  async createFile(path, content, message) {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message || `Create ${path}`,
        content: btoa(unescape(encodeURIComponent(content)))
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${path}: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFile(path, sha, message) {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message || `Delete ${path}`,
        sha: sha
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${path}: ${response.statusText}`);
    }

    localStorage.removeItem(this.getCacheKey(path));
    return response.json();
  }

  async listDirectory(path = '') {
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list ${path}: ${response.statusText}`);
    }

    return response.json();
  }

  async getManifest(appPath) {
    try {
      const file = await this.getFile(`${appPath}/manifest.json`);
      return JSON.parse(file.content);
    } catch (error) {
      return null;
    }
  }
}

window.repo = null;

function initRepo(token) {
  window.repo = new GitHubRepo('jonasneves', 'duke-capstone', token);
  return window.repo;
}
