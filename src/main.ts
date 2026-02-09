import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import { setupDirectives } from './directives'

// Import global styles
import './assets/styles/global.css'
import './assets/styles/variables.css'
import './assets/styles/animations.css'

const app = createApp(App)

// Register plugins
app.use(createPinia())
app.use(router)
app.use(i18n)

// Register custom directives
setupDirectives(app)

app.mount('#app')
