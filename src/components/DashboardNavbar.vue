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
defineEmits<{
  "toggle-drawer": [];
}>();
</script>

<style scoped lang="sass">
.logo-text
  font-size: 16px
  font-weight: bold
  letter-spacing: 1px
</style>
