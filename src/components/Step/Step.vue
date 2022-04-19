<template>
<!--  if "isActive" is true, div is assigned class "active"-->
  <button :class="{ active: isActive }" @click="toggleStep">{{ instrument }}</button>
  <br>
</template>

<script setup lang="ts">
import {ref} from "vue";

defineProps({
  instrument: String,
  color: String,
})

const isActive = ref(false);

function toggleStep() {
  isActive.value = !isActive.value;
}

</script>

<style scoped>
button {
  border: none;
  background: none;
}

.active {
  font-weight: bolder;
}
</style>