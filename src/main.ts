import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify } from 'quasar'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'
import router from './router'
import { setupNetworkListeners } from './utils/networkStatus'
import { db } from './utils/db'

// Initialize theme before app creation to avoid flash
const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
  // Apply theme immediately by setting the class on body
  // This prevents flash of wrong theme on initial load
  document.body.classList.toggle('body--dark', savedTheme === 'dark')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: {
    Notify,
  },
})

// Initialize IndexedDB and network listeners
async function initializeApp() {
  try {
    // vite-plugin-pwa automatically registers the service worker
    // No manual registration needed
    
    // Initialize Dexie database
    await db.open()
    console.log('[App] IndexedDB initialized successfully')

    // Setup network status listeners
    setupNetworkListeners()
    console.log('[App] Network listeners initialized')

    // Initialize offline queue auto-sync
    const { offlineQueue } = await import('./utils/offlineQueue')
    offlineQueue.setupAutoSync()
    console.log('[App] Offline queue initialized')

    // Initialize store caches on startup for offline support
    const { useOutletStore } = await import('./stores/outlet')
    const { useSalesStore } = await import('./stores/sales')
    
    const outletStore = useOutletStore()
    const salesStore = useSalesStore()
    
    // Preload cached data in background
    await Promise.allSettled([
      outletStore.initializeCache(),
      salesStore.initializeCache(),
    ])
    console.log('[App] Store caches initialized')
  } catch (error) {
    console.error('[App] Failed to initialize cache:', error)
  }
}

// Initialize before mounting
initializeApp().then(() => {
  app.mount('#app')
})
