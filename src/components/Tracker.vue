<template>
  <div class="title">
    <h1><span class="accent">Quick</span>Tracker</h1>
  </div>
  <div class="container">
    <Track
        v-for="col in columns"
        :key="col.id"
        :name="col.name"
    />
  </div>
</template>

<script setup lang="ts">
import Track from "./Track.vue";

const columns = [
  { id: 0, name: "#" },
  { id: 1, name: "K" },
  { id: 2, name: "S" },
  { id: 3, name: "H" },
  { id: 4, name: "X" },
  { id: 5, name: "#" }
];

</script>

<style scoped>

h1 {
  color: whitesmoke;
  font-size: xxx-large;
}

.accent {
  color: gray;
}

.container {
  display: grid;
  grid-template-columns: 100px 50px 50px 50px 50px 100px;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 0 0;
  grid-auto-flow: row;
  justify-content: center;
  align-content: center;
  justify-items: center;
  align-items: center;
  width: 10vw;
  height: 693px;
  margin: auto;
  padding: 20px 110px 0 110px;
  grid-template-areas:
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . ."
    ". . . . . .";
}
</style>