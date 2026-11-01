import '@fontsource-variable/figtree/wght.css'
import '@fontsource-variable/onest/wght.css'
import './styles/tokens.css'
import './styles/base.css'

import { createApp } from 'vue'

import App from './App.vue'
import { locale } from './lib/i18n'

document.documentElement.lang = locale

createApp(App).mount('#app')
