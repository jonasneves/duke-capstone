export const AppConfig = {
  version: '1.0.0',

  repository: {
    owner: 'jonasneves',
    name: 'playground'
  },

  branding: {
    title: 'Playground',
    subtitle: 'Launch and experiment with apps',
    theme: {
      primary: '#1e3a5f',
      secondary: '#2c4f7c'
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
