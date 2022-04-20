<template>
  <div class="track-wrapper">
    <Step
        v-for="step in steps"
        :key="step"
        :track-name="name"
        :step-nb="step"
    />
  </div>
</template>

<script setup lang="ts">
import Step from "./Step.vue";

defineProps({
  name: String,
})

const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

</script>

<style scoped>

.track-wrapper {
  margin: 0 0.5em 0 0.5em;
}

</style>