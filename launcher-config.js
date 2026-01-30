window.LAUNCHER_CONFIG = {
  version: '1.0.0',

  repository: {
    owner: 'jonasneves',
    name: 'duke-capstone'
  },

  branding: {
    title: 'Prototype Gallery',
    subtitle: 'Your private collection of experimental applications',
    theme: {
      primary: '#6366f1',
      secondary: '#8b5cf6'
    }
  },

  features: {
    analytics: true,
    errorTracking: true,
    serviceWorker: false, // Only on gh-pages
    caching: true
  },

  api: {
    baseUrl: 'https://api.github.com/repos',
    cacheTimeout: 300000 // 5 minutes
  }
};
