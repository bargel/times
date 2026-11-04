import './keepUpdated'

import '@fontsource-variable/figtree/wght.css'
import '@fontsource-variable/onest/wght.css'
import './styles/tokens.css'
import './styles/base.css'

import { createApp } from 'vue'

import App from './App.vue'
import { startHolding } from './lib/heldViewport'
import { locale } from './lib/i18n'

document.documentElement.lang = locale

startHolding()

// Safari ignores `user-scalable=no` in the viewport tag; this is what stops a pinch there.
document.addEventListener('gesturestart', (event) => event.preventDefault(), { passive: false })

createApp(App).mount('#app')
