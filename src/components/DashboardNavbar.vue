<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="$emit('toggle-drawer')"
      />
      <q-toolbar-title class="q-ml-md">
        <q-avatar size="32px" color="white" text-color="primary">
          <div class="logo-text">DM</div>
        </q-avatar>
        <span class="q-ml-sm">DMS App</span>
      </q-toolbar-title>
      <q-space />
      <q-toggle
        :model-value="isDark"
        @update:model-value="toggleTheme"
        checked-icon="dark_mode"
        unchecked-icon="light_mode"
        color="white"
        size="md"
        class="q-mr-md"
        aria-label="Toggle theme"
      />
      <q-btn flat dense round icon="notifications" aria-label="Notifications">
        <q-badge color="red" floating rounded />
      </q-btn>
      <q-btn
        flat
        dense
        round
        class="q-ml-md"
        icon="account_circle"
        aria-label="Account"
      />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

defineEmits<{
  "toggle-drawer": [];
}>()

const $q = useQuasar()
const isDark = ref($q.dark.isActive)

// Load theme preference from localStorage on mount
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    const shouldBeDark = savedTheme === 'dark'
    $q.dark.set(shouldBeDark)
    isDark.value = shouldBeDark
  } else {
    // Default to current dark mode state if no saved theme
    isDark.value = $q.dark.isActive
  }
})

// Toggle theme and persist to localStorage
const toggleTheme = (value: boolean) => {
  $q.dark.set(value)
  isDark.value = value
  localStorage.setItem('theme', value ? 'dark' : 'light')
}

// Watch for external theme changes (e.g., system preference)
watch(() => $q.dark.isActive, (newValue) => {
  isDark.value = newValue
})
</script>

<style scoped lang="sass">
.logo-text
  font-size: 16px
  font-weight: bold
  letter-spacing: 1px
</style>
