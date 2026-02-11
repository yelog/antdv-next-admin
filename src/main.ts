import { createApp } from 'vue'
import { createPinia } from 'pinia'
import AntdvNext from 'antdv-next'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import { setupDirectives } from './directives'
import { registerDefaultComponentProps } from './components/Global/defaultComponentProps'

// Import global styles
import 'antdv-next/dist/reset.css'
import './assets/styles/global.css'
import './assets/styles/variables.css'
import './assets/styles/animations.css'

const app = createApp(App)

// Register plugins
app.use(createPinia())
app.use(AntdvNext)
app.use(router)
app.use(i18n)
registerDefaultComponentProps(app)

// Register custom directives
setupDirectives(app)

app.mount('#app')
