import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import { registerDefaultComponentProps } from './components/Global/defaultComponentProps';
import { setupDirectives } from './directives';
import i18n from './locales';
import router from './router';
// Import global styles
// Tailwind CSS with @layer configuration (must come after reset.css)
import 'antdv-next/dist/reset.css';
import './assets/styles/tailwind.css';
import './assets/styles/variables.css';
import './assets/styles/animations.css';
import './assets/styles/global.css';

const app = createApp(App);

// Register plugins
app.use(createPinia());
app.use(router);
app.use(i18n);
registerDefaultComponentProps(app);

// Register custom directives
setupDirectives(app);

app.mount('#app');
