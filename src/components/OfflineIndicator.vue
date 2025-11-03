<template>
  <q-banner
    v-if="!isOnline"
    class="bg-warning text-dark q-ma-md"
    rounded
  >
    <template v-slot:avatar>
      <q-icon name="cloud_off" color="dark" />
    </template>
    <div class="row items-center">
      <span class="text-body2">You're offline. Some features may be limited.</span>
      <q-space />
      <q-btn
        v-if="pendingSyncCount > 0"
        flat
        dense
        :label="`${pendingSyncCount} pending sync${pendingSyncCount > 1 ? 's' : ''}`"
        color="dark"
        class="q-ml-sm"
      />
    </div>
  </q-banner>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useNetworkStatus } from '../utils/networkStatus'
import { offlineQueue } from '../utils/offlineQueue'

const { isOnline } = useNetworkStatus()
const pendingSyncCount = ref(0)

let unsubscribe: (() => void) | null = null

onMounted(() => {
  // Subscribe to queue count changes
  unsubscribe = offlineQueue.subscribe((count) => {
    pendingSyncCount.value = count
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

