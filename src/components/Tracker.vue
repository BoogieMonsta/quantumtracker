<template>
  <div class="title">
    <h1><span class="accent">Quick</span>Tracker</h1>
  </div>
  <div class="tracks-container">
    <Track/>
    <Track/>
    <Track/>
    <Track/>
  </div>
</template>

<script setup lang="ts">
import Track from "./Track/Track.vue";
</script>

<style scoped>
  .tracks-container {
    display: flex;
    justify-content: center;
  }
</style>