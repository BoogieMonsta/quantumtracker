<template>
<!--  if "isActive" is true, button is assigned class "active" -->
<!--  if track is a ruler, button is assigned class "ruler" -->
  <div class="step-wrapper">
    <button
        :class="[
            { active: isActive },
            { ruler: trackName === '#' },
            ]"
        :style="{
          'color': !isActive ? 'rgba(69, 75, 80, 0.5)' : getInstruColor(trackName)
        }"
        @click="toggleStep(trackName, stepNb)">
      {{ displayStep(trackName, stepNb) }}
    </button>
    <br>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  trackName: String,
  stepNb: Number,
})

const emit = defineEmits(['triggerSample', 'toggleStepInSeq']);

const isActive = ref(false);

function toggleStep(trackName: string, stepNb: number) {
  if (trackName !== '#') {
    isActive.value = !isActive.value;
  }
  if (isActive.value) {
    triggerSample();
  }
  toggleStepInSeq(stepNb);
}

function triggerSample() {
  emit('triggerSample');
}

function toggleStepInSeq(stepNb: number) {
  emit('toggleStepInSeq', stepNb);
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
  color: whitesmoke;
color: rgba(69, 75, 80, 0.5)
}

.active {
  font-weight: bolder;
}

.ruler {
  cursor: default;
}
</style>