<template>
  <!--  if "isActive" is true, button is assigned class "active" -->
  <!--  if track is a ruler, button is assigned class "ruler" -->
  <div class="step-wrapper">
    <button
        :class="[
            { active: isActive },
            { ruler: trackName === '#' },
            { sample: trackName !== '#' },
            ]"
        :style="{
          'color': !isActive ? 'rgba(69, 75, 80, 0.5)' : getInstruColor(trackName as string)
        }"
        @click="toggleStep(trackName as string)">
      {{ displayStep(trackName as string, stepNb as number) }}
    </button>
    <br>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

defineProps({
  trackName: String,
  stepNb: Number,
})

const emit = defineEmits(['triggerSample', 'toggleStepInSeq']);

const isActive = ref(false);

function toggleStep(trackName: string) {
  if (trackName !== '#') {
    isActive.value = !isActive.value;
  }
  if (isActive.value) {
    triggerSample();
  }
  toggleStepInSeq();
}

function triggerSample() {
  emit('triggerSample');
}

function toggleStepInSeq() {
  emit('toggleStepInSeq');
}

function displayStep(trackName: string, stepNb: number) {
  return trackName === '#' ? stepNb : trackName.toUpperCase()[0];
}

function getInstruColor(trackName: string): string {
  let color = '';
  switch (trackName) {
    case 'Kick': {
      color = '#ff3c2f';
      break;
    }
    case 'Snare': {
      color = '#ffd50a';
      break;
    }
    case 'Hihat': {
      color = '#30d158';
      break;
    }
    case 'Xtra': {
      color = '#00d2fe';
      break;
    }
  }
  return color;
}

</script>

<style scoped>

button {
  border: none;
  background: none;
  font-size: 25pt;
  cursor: pointer;
  line-height: 1.2em;
  color: rgba(69, 75, 80, 0.5)
}

.sample {
  font-family: 'Nexa Rust Sans';
}

.active {
  /* font-weight: bolder; */
}

.ruler {
  cursor: default;
  font-family: 'Fira Code';
}

</style>