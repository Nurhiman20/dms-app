import { ref } from 'vue'

/**
 * Network status state
 */
export const isOnline = ref(navigator.onLine)

/**
 * Check network status with fallback validation
 * Uses navigator.onLine first, then validates with a fetch request
 */
export async function checkNetworkStatus(): Promise<boolean> {
  // Primary check
  if (!navigator.onLine) {
    isOnline.value = false
    return false
  }

  // Fallback: Try to fetch a small resource to validate connectivity
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    isOnline.value = response.ok
    return response.ok
  } catch {
    isOnline.value = false
    return false
  }
}

/**
 * Setup network status listeners
 * Call this once in your main.ts
 */
export function setupNetworkListeners(): () => void {
  const handleOnline = () => {
    checkNetworkStatus().then((online) => {
      isOnline.value = online
      if (online) {
        console.log('[Network] Status: Online')
      }
    })
  }

  const handleOffline = () => {
    isOnline.value = false
    console.log('[Network] Status: Offline - Using cached data')
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Initial check
  checkNetworkStatus()

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * Vue composable for network status
 */
export function useNetworkStatus() {
  return {
    isOnline,
    checkNetworkStatus,
  }
}
