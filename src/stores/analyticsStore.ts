import { create } from 'zustand';

interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
}

interface MetricEntry {
  app: string;
  metric: string;
  value: number;
  timestamp: number;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  errors: ErrorLog[];
  metrics: MetricEntry[];
  track: (type: string, data?: Record<string, any>) => void;
  logError: (error: ErrorLog) => void;
  trackMetric: (app: string, metric: string, value: number) => void;
  getMetrics: (app: string) => MetricEntry[];
}

export const useAnalyticsStore = create<AnalyticsState>()((set, get) => ({
  events: [],
  errors: [],
  metrics: [],

  track: (type, data = {}) => {
    const event: AnalyticsEvent = {
      type,
      data,
      timestamp: Date.now()
    };
    set(state => {
      const newEvents = [...state.events, event];
      return { events: newEvents.length > 100 ? newEvents.slice(-100) : newEvents };
    });
    console.log('[Analytics]', type, data);
  },

  logError: (error) => {
    set(state => {
      const newErrors = [...state.errors, error];
      return { errors: newErrors.length > 50 ? newErrors.slice(-50) : newErrors };
    });
    console.error('[Error]', error);
  },

  trackMetric: (app, metric, value) => {
    const entry: MetricEntry = { app, metric, value, timestamp: Date.now() };
    set(state => {
      const newMetrics = [...state.metrics, entry];
      return { metrics: newMetrics.length > 200 ? newMetrics.slice(-200) : newMetrics };
    });
  },

  getMetrics: (app) => {
    return get().metrics.filter(m => m.app === app);
  }
}));
