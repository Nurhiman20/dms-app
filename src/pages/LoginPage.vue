<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="row no-wrap-sm">
        <!-- Left Side - Background Image -->
        <div class="col-xs-0 col-sm-6 login-left-panel">
          <div class="login-background-image"></div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="col-xs-12 col-sm-6 login-right-panel">
          <div class="login-container">
            <!-- Logo and Welcome -->
            <div class="login-content">
              <div class="login-logo">
                <q-avatar size="80px" color="primary" text-color="white" class="q-mb-sm">
                  <div class="logo-text">DMS</div>
                </q-avatar>
              </div>

              <h1 class="login-title">Welcome Back to <br />DMS App</h1>
              <p class="login-subtitle">Please login to your account</p>

              <!-- Role Selector -->
              <div class="login-form">
                <q-select
                  v-model="selectedRole"
                  :options="roleOptions"
                  label="Select Role"
                  outlined
                  class="q-mb-md"
                  bg-color="white"
                  :dense="false"
                  options-dense
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-select>

                <!-- Login Button -->
                <q-btn
                  unelevated
                  color="primary"
                  size="md"
                  :label="isLoading ? 'Logging in...' : 'Login'"
                  class="full-width login-button q-mb-lg"
                  :disable="!selectedRole || isLoading"
                  :loading="isLoading"
                  @click="handleLogin"
                />

                <!-- Error Message -->
                <q-banner
                  v-if="errorMessage"
                  class="bg-negative text-white q-mt-md"
                  rounded
                >
                  {{ errorMessage }}
                </q-banner>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { login } from "../services/authApi";

const router = useRouter();
const $q = useQuasar();

const selectedRole = ref<string | null>(null);
const roleOptions = ["Admin", "Sales"];
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

const handleLogin = async () => {
  if (!selectedRole.value) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;

  try {
    // Check if already authenticated and offline - allow access with cached credentials
    const existingUser = localStorage.getItem("user");
    const existingToken = localStorage.getItem("token");
    const { checkNetworkStatus } = await import("../utils/networkStatus");
    const isOnline = await checkNetworkStatus();

    if (!isOnline && existingUser && existingToken) {
      // Offline but already authenticated - allow access
      const user = JSON.parse(existingUser);
      $q.notify({
        type: "info",
        message: `Welcome back, ${user.name}! (Offline mode)`,
        position: "top",
      });
      router.push({ name: "dashboard" });
      isLoading.value = false;
      return;
    }

    // Try to login online
    const response = await login({ role: selectedRole.value });

    if (response.success) {
      // Show success notification
      $q.notify({
        type: "positive",
        message: `Welcome, ${response.user.name}!`,
        position: "top",
      });

      // Store user info in localStorage (or use a store)
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      // Navigate to dashboard
      router.push({ name: "dashboard" });
    }
  } catch (error) {
    // If offline and login fails, check if we can use cached credentials
    const existingUser = localStorage.getItem("user");
    const existingToken = localStorage.getItem("token");

    if (existingUser && existingToken) {
      // Use cached credentials
      try {
        const { checkNetworkStatus } = await import("../utils/networkStatus");
        const isOnline = await checkNetworkStatus();
        if (!isOnline) {
          const user = JSON.parse(existingUser);
          $q.notify({
            type: "info",
            message: `Using cached credentials. Welcome, ${user.name}! (Offline mode)`,
            position: "top",
          });
          router.push({ name: "dashboard" });
          isLoading.value = false;
          return;
        }
      } catch {
        // Continue to error handling
      }
    }

    const message =
      error instanceof Error ? error.message : "Login failed. Please try again.";
    errorMessage.value = message;
    $q.notify({
      type: "negative",
      message: message,
      position: "top",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="sass">
.login-left-panel
  position: relative
  min-height: 100vh
  padding: 0
  display: none

@media (min-width: 600px)
  .login-left-panel
    display: block

.login-right-panel
  display: flex
  align-items: center
  justify-content: center
  background-color: #ffffff
  min-height: 100vh
  padding: 0

.login-background-image
  width: 100%
  height: 100vh
  background-image: url('/images/hero-login.webp')
  background-size: cover
  background-position: center
  background-repeat: no-repeat

.login-container
  width: 100%
  max-width: 480px
  padding: 40px
  margin: 0 auto

@media (max-width: 599px)
  .login-container
    padding: 24px

.login-header
  display: flex
  justify-content: flex-end
  gap: 16px
  margin-bottom: 40px

.login-content
  display: flex
  flex-direction: column
  align-items: center
  width: 100%

.login-logo
  display: flex
  justify-content: center
  margin-bottom: 24px

.logo-text
  font-size: 32px
  font-weight: bold
  letter-spacing: 1px

.login-title
  font-size: 32px
  font-weight: 700
  color: #1D1D1D
  margin: 0 0 8px 0
  text-align: center
  line-height: 1.4

.login-subtitle
  font-size: 16px
  color: #6B7280
  margin: 0 0 40px 0
  text-align: center

.login-form
  width: 100%
  max-width: 400px

.login-button
  font-size: 16px
  font-weight: 600
  padding: 12px 24px
</style>
