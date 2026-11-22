export const isDemoBuild = import.meta.env.VITE_DEMO_MODE === 'true';
export const usesMockData =
  isDemoBuild || (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true');
