<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header / Navbar -->
    <DashboardNavbar @toggle-drawer="toggleLeftDrawer" />

    <!-- Sidebar -->
    <DashboardSidebar v-model="leftDrawerOpen" />

    <!-- Main Content -->
    <q-page-container :class="pageContainerClass">
      <OfflineIndicator />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import DashboardNavbar from "../components/DashboardNavbar.vue";
import DashboardSidebar from "../components/DashboardSidebar.vue";
import OfflineIndicator from "../components/OfflineIndicator.vue";

const $q = useQuasar();
const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

// Theme-aware background class
const pageContainerClass = computed(() => {
  return $q.dark.isActive ? "bg-dark" : "bg-grey-1";
});
</script>
