export const AppConfig = {
  version: '1.0.0',

  repository: {
    owner: 'jonasneves',
    name: 'playground'
  },

  branding: {
    title: 'Playground',
    subtitle: 'Multi-app launcher powered by GitHub API',
    theme: {
      primary: '#6366f1',
      secondary: '#8b5cf6'
    }
  },

  features: {
    analytics: true,
    errorTracking: true,
    serviceWorker: false,
    caching: true
  },

  api: {
    baseUrl: 'https://api.github.com/repos',
    cacheTimeout: 300000 // 5 minutes
  },

  oauth: {
    serviceUrl: 'https://oauth.neevs.io'
  }
};
