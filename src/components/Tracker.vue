<template>
  <div class="title">
    <h1><span class="accent">Quick</span>Tracker</h1>
  </div>
  <button id="play">PLAY</button>
  <div class="container">
    <Track
        v-for="col in columns"
        :key="col.id"
        :name="col.name"
    />
  </div>
</template>

<script setup lang="ts">
import Track from './Track.vue';
import { el } from '@elemaudio/core';
import WebRenderer from '@elemaudio/web-renderer-lite';
import kick from '../assets/samples/kick.mp3';
import snare from '../assets/samples/snare.mp3';
import hhClosed from '../assets/samples/hhClosed.mp3';

const ctx = new window.AudioContext();
const core = new WebRenderer();


// After we've imported and set up our context, we install a load event listener
// so that once the audio backend is ready we can kick off our render
core.on('load', function() {
  // Before actually rendering anything we put a click handler on the button so that
  // this example doesn't start making noise automatically
  document.getElementById('play')?.addEventListener('mousedown', async function(e) {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    core.render(
        el.mul(0.25, el.sample(
            {path: 'snare.mp3:0'}, el.const({key: 'hi', value: 1}), 1)
        ),
        el.mul(0.25, el.sample(
            {path: 'snare.mp3:1'}, el.const({key: 'hi', value: 1}), 1)
        ),
    );
  });

  document.getElementById('play')?.addEventListener('mouseup', async function(e) {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    core.render(
        el.mul(0.25, el.sample(
            {path: 'snare.mp3:0'}, el.const({key: 'hi', value: 0}), 1)
        ),
        el.mul(0.25, el.sample(
            {path: 'snare.mp3:1'}, el.const({key: 'hi', value: 0}), 1)
        ),
    );
  });
});

// After installing our load event handler, we initialize the core renderer
// which will spin up the audio backend with the web audio context and fire
// our load event above when ready.
(async function main() {
  let res = await fetch(snare);
  let sampleBuffer = await ctx.decodeAudioData(await res.arrayBuffer());

  let node = await core.initialize(ctx, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
    processorOptions: {
      virtualFileSystem: {
        'snare.mp3:0': sampleBuffer.getChannelData(0),
        'snare.mp3:1': sampleBuffer.getChannelData(1),
      }
    }
  });

  node.connect(ctx.destination);
})();

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

#play {
  color: whitesmoke;
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