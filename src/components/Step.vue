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
          'background': !isActive ? '-webkit-radial-gradient(#4b4b4b, #2f2f2f)'
 : getInstruColor(trackName as string),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
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
  let color = '-webkit-radial-gradient(';
  switch (trackName) {
    case 'Kick': {
      color += '#ff3c2f';
      break;
    }
    case 'Snare': {
      color += '#ffd50a';
      break;
    }
    case 'Hihat': {
      color += '#30d158';
      break;
    }
    case 'Xtra': {
      color += '#00d2fe';
      break;
    }
  }
  return color + ', #2f2f2f)';
}

</script>

<style scoped>

button {
  border: none;
  background: -webkit-radial-gradient(#4b4b4b, #2f2f2f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 25pt;
  cursor: pointer;
  line-height: 1.2em;
}

.active {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sample {
  font-family: 'Nexa Rust Sans';
}

.ruler {
  cursor: default;
  font-family: 'Fira Code';
}

</style>