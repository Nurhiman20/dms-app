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
                  label="Login"
                  class="full-width login-button q-mb-lg"
                  :disable="!selectedRole"
                  @click="handleLogin"
                />
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

const selectedRole = ref<string | null>(null);
const roleOptions = ["Admin", "Sales"];

const handleLogin = () => {
  if (selectedRole.value) {
    console.log("Login with role:", selectedRole.value);
    // TODO: Implement login logic
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
