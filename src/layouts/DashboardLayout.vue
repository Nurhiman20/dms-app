<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header / Navbar -->
    <DashboardNavbar @toggle-drawer="toggleLeftDrawer" />

    <!-- Sidebar -->
    <DashboardSidebar v-model="leftDrawerOpen" />

    <!-- Main Content -->
    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DashboardNavbar from "../components/DashboardNavbar.vue";
import DashboardSidebar from "../components/DashboardSidebar.vue";

const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
