import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import { registerDefaultComponentProps } from './components/Global/defaultComponentProps';
import { setupDirectives } from './directives';
import i18n from './locales';
import router from './router';
import { service } from './utils/request';
// Import global styles
// Tailwind CSS with @layer configuration (must come after reset.css)
import 'antdv-next/dist/reset.css';
import './assets/styles/tailwind.css';
import './assets/styles/variables.css';
import './assets/styles/animations.css';
import './assets/styles/global.css';

function restoreGitHubPagesRedirect() {
  const redirect = sessionStorage.getItem('redirect');
  if (!redirect) return;

  sessionStorage.removeItem('redirect');

  const redirectUrl = new URL(redirect);
  const target = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (target !== current) {
    window.history.replaceState(null, '', target);
  }
}

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { setupBrowserMock } = await import('./mock/browser');
    setupBrowserMock(service);
  }

  restoreGitHubPagesRedirect();

  const app = createApp(App);

  // Register plugins
  app.use(createPinia());
  app.use(router);
  app.use(i18n);
  registerDefaultComponentProps(app);

  // Register custom directives
  setupDirectives(app);

  app.mount('#app');
}

void bootstrap();
