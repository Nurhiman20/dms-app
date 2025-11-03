<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    show-if-above
    bordered
    :width="280"
    :breakpoint="1024"
    class="bg-white"
  >
    <q-scroll-area class="fit">
      <q-list padding class="menu-list">
        <!-- Dashboard -->
        <q-item
          clickable
          v-ripple
          :active="route.name === 'dashboard'"
          active-class="menu-item-active"
          :to="{ name: 'dashboard' }"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Outlets -->
        <q-item
          clickable
          v-ripple
          :active="route.name === 'outlets'"
          active-class="menu-item-active"
          :to="{ name: 'outlets' }"
        >
          <q-item-section avatar>
            <q-icon name="store" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Outlets</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Divider -->
        <q-separator class="q-my-md" />

        <!-- Reports -->
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Reports</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Settings -->
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Settings</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Logout -->
        <q-item clickable v-ripple class="q-mt-lg" @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { logout } from "../services/authApi";

defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const handleLogout = async () => {
  try {
    // Call logout API
    await logout();

    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Show success notification
    $q.notify({
      type: "info",
      message: "Logged out successfully",
      position: "top",
    });

    // Navigate to login page
    router.push({ name: "login" });
  } catch (error) {
    // Even if API fails, clear local data and logout
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    const message = error instanceof Error ? error.message : "Logout failed";
    $q.notify({
      type: "negative",
      message: message,
      position: "top",
    });

    // Still navigate to login page
    router.push({ name: "login" });
  }
};
</script>

<style scoped lang="sass">
.menu-list
  padding: 8px 0

.menu-item-active
  color: primary
  background-color: rgba(25, 118, 210, 0.1)

.q-item
  border-radius: 8px
  margin: 4px 8px

.q-item__label
  font-weight: 500
</style>
