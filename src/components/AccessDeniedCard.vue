<template>
  <div class="access-denied-container">
    <q-card flat bordered :class="['access-card', cardClass]">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="lock" size="64px" color="negative" class="q-mb-md" />
        <h2 class="access-denied-title">{{ title || "Access Denied" }}</h2>
        <p class="access-denied-text">
          {{ message }}
        </p>
        <q-btn
          v-if="buttonLabel"
          unelevated
          color="primary"
          :label="buttonLabel"
          @click="$emit('action')"
          class="q-mt-md"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuasar } from "quasar";

defineProps<{
  title?: string;
  message: string;
  buttonLabel?: string;
}>();

defineEmits<{
  (e: "action"): void;
}>();

const $q = useQuasar();
const cardClass = computed(() => {
  return $q.dark.isActive ? "bg-grey-9" : "bg-white";
});
</script>

<style scoped lang="sass">
.access-denied-container
  max-width: 600px
  margin: 0 auto
  margin-top: 64px

.access-denied-title
  font-size: 24px
  font-weight: 600
  margin: 16px 0
  color: #DC2626

.access-denied-text
  font-size: 16px
  color: #6B7280
  margin: 0 0 24px 0
  line-height: 1.5
</style>
