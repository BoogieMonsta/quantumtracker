<template>
  <div class="title">
    <h1><span class="accent">Quick</span>Tracker</h1>
  </div>
  <div class="tracks-container">
    <Ruler/>
    <Track
        v-for="track in tracks"
        :key="track.id"
        :trackName="track.name"
        :color="track.color"
    />
    <Ruler/>
  </div>
</template>

<script setup lang="ts">
import Track from "./Track/Track.vue";
import Ruler from "./Ruler.vue"
defineProps({
  track: String
})

const tracks = [
  { id: 1, name: "K", color: "indianred" },
  { id: 2, name: "S", color: "sandybrown" },
  { id: 3, name: "H", color: "lightgreen" },
  { id: 4, name: "X", color: "lightskyblue" }
];

</script>

<style scoped>
  .tracks-container {
    display: flex;
    justify-content: center;
  }
</style>