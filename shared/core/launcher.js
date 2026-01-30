/**
 * Core Launcher - Handles app loading, iframe management, and UI
 */

class Launcher {
  constructor(config, repo, elements) {
    this.config = config;
    this.repo = repo;
    this.elements = elements;
    this.currentApp = null;
  }

  async init() {
    this.setupUserMenu();
    this.setupKeyboardShortcuts();
    this.setupAppLaunchers();
    await this.loadApps();
    lucide.createIcons();
  }

  setupAppLaunchers() {
    this.elements.appGrid.addEventListener('click', (e) => {
      const launchBtn = e.target.closest('.launch-btn');
      if (launchBtn) {
        e.preventDefault();
        const path = launchBtn.dataset.appPath;
        const name = launchBtn.dataset.appName;
        this.loadApp(path, name);
      }
    });
  }

  async loadApps() {
    try {
      const apps = await this.repo.listDirectory('apps');
      const directories = apps.filter(a => a.type === 'dir');

      this.elements.loading.style.display = 'none';
      this.elements.appGrid.style.display = 'grid';

      directories.forEach(app => this.renderPlaceholderCard(app));

      await Promise.all(directories.map(async (app, index) => {
        await new Promise(resolve => setTimeout(resolve, index * 100));
        const manifest = await this.repo.getManifest(app.path);
        if (manifest) {
          this.updateCardWithManifest(app.name, manifest, app.path);
        }
      }));

      lucide.createIcons();
    } catch (error) {
      this.elements.loading.innerHTML = `<div class="error"><strong>Error:</strong> ${error.message}</div>`;
    }
  }

  renderPlaceholderCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.id = `app-${app.name}`;
    card.innerHTML = `
      <div class="app-card-body">
        <h3>${app.name}</h3>
        <p style="color: #ccc;">Loading...</p>
      </div>
    `;
    this.elements.appGrid.appendChild(card);
  }

  updateCardWithManifest(appName, manifest, path) {
    const card = document.getElementById(`app-${appName}`);
    if (!card) return;

    const versionWarning = this.checkVersionCompatibility(manifest);
    const tech = manifest.tech ? manifest.tech.map(t => `<span class="badge">${t}</span>`).join('') : '';
    const warning = versionWarning ? `<div style="color: #f59e0b; font-size: 13px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;"><i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i> ${versionWarning}</div>` : '';

    card.innerHTML = `
      <img src="${manifest.thumbnail || ''}" alt="${manifest.name}" onerror="this.style.display='none'">
      <div class="app-card-body">
        <h3>${manifest.name}</h3>
        <p>${manifest.description}</p>
        ${warning}
        <div class="app-meta">${tech}</div>
        <a href="#" data-app-path="${path}" data-app-name="${manifest.name}" class="launch-btn">Launch App <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i></a>
      </div>
    `;
  }

  checkVersionCompatibility(manifest) {
    if (!manifest.minLauncherVersion) return null;

    const current = this.config.version.split('.').map(Number);
    const required = manifest.minLauncherVersion.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (current[i] < required[i]) {
        return `Requires launcher v${manifest.minLauncherVersion}`;
      }
      if (current[i] > required[i]) return null;
    }
    return null;
  }

  async loadApp(appPath, appName) {
    try {
      this.elements.appLoader.style.display = 'flex';
      this.currentApp = { path: appPath, name: appName };

      if (window.analytics) {
        analytics.track('app_launch', { appName, appPath });
      }

      const file = await this.repo.getFile(`${appPath}/index.html`);

      const injectionScript = `<script>
        window.INJECTED_TOKEN = ${JSON.stringify(this.repo.token)};
        window.INJECTED_USER = ${JSON.stringify(window.GitHubAuth.getUser())};
        window.PARENT_REPO = window.parent.launcher.repo;
      </script>`;

      const htmlWithInjection = file.content.replace('<head>', '<head>' + injectionScript);

      this.elements.appFrame.onload = () => {
        this.elements.appLoader.style.display = 'none';
        this.showHint();
      };

      this.elements.appFrame.srcdoc = htmlWithInjection;
      this.elements.appFrame.style.display = 'block';

    } catch (error) {
      if (window.errorTracker) {
        errorTracker.log(error, { context: 'loadApp', appPath });
      }
      alert(`Error loading app: ${error.message}`);
      this.elements.appLoader.style.display = 'none';
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (this.elements.appFrame.style.display !== 'block') return;
      if (e.key === 'Escape') {
        this.closeApp();
      }
    });

    window.addEventListener('message', (e) => {
      if (e.data === 'close-app') {
        this.closeApp();
      }
    });
  }

  closeApp() {
    this.elements.appFrame.style.display = 'none';
    this.elements.appFrame.onload = null;
    this.elements.hint.classList.remove('visible');
    this.currentApp = null;
    this.elements.appFrame.srcdoc = '';
  }

  showHint() {
    this.elements.hint.classList.add('visible');
    setTimeout(() => this.elements.hint.classList.remove('visible'), 3000);
  }

  clearAllCache() {
    if (confirm('Clear all cached data? Apps will reload from the repository.')) {
      this.repo.clearCache();
      location.reload();
    }
  }

  logout() {
    if (confirm('Logout?')) window.GitHubAuth.logout();
  }

  setupUserMenu() {
    const pill = document.getElementById('userPill');
    const menu = document.getElementById('userMenu');

    const actions = {
      'refresh': () => location.reload(),
      'clear-cache': () => this.clearAllCache(),
      'logout': () => this.logout()
    };

    pill.addEventListener('click', (e) => {
      if (e.target.closest('.user-menu')) return;
      e.stopPropagation();
      menu.classList.toggle('show');
    });

    menu.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      e.stopPropagation();
      menu.classList.remove('show');

      const handler = actions[button.dataset.action];
      if (handler) handler();
    });

    document.addEventListener('click', (e) => {
      if (!pill.contains(e.target)) {
        menu.classList.remove('show');
      }
    });
  }
}

window.Launcher = Launcher;
