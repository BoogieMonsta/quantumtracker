<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Tracker from './components/Tracker.vue';
import WebRenderer from '@elemaudio/web-renderer-lite';
import kick from './assets/samples/kick.mp3';
import snare from './assets/samples/snare.mp3';
import hhClosed from './assets/samples/hhClosed.mp3';
import hhOpen from './assets/samples/hhOpen.mp3';
import clap from './assets/samples/clap.mp3';

let core = new WebRenderer();
const ctx = new window.AudioContext();

core.on('load', async () => {
  document
    .getElementById('clickMe')
    ?.addEventListener('click', async function (e) {
      if (ctx.state !== 'running') {
        await ctx.resume();
      }
      // FIXME: get nodes from Tracker.vue and render them
    });
});

(async function main() {
  let kickSmp = await fetch(kick);
  let snareSmp = await fetch(snare);
  let hhClosedSmp = await fetch(hhClosed);
  let clapSmp = await fetch(clap);

  let sampleBufferK = await ctx.decodeAudioData(await kickSmp.arrayBuffer());
  let sampleBufferS = await ctx.decodeAudioData(await snareSmp.arrayBuffer());
  let sampleBufferH = await ctx.decodeAudioData(
    await hhClosedSmp.arrayBuffer(),
  );
  let sampleBufferC = await ctx.decodeAudioData(await clapSmp.arrayBuffer());

  let node = await core.initialize(ctx, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
    processorOptions: {
      virtualFileSystem: {
        'kick.mp3:0': sampleBufferK.getChannelData(0),
        'kick.mp3:1': sampleBufferK.getChannelData(1),
        'snare.mp3:0': sampleBufferS.getChannelData(0),
        'snare.mp3:1': sampleBufferS.getChannelData(1),
        'hhClosed.mp3:0': sampleBufferH.getChannelData(0),
        'hhClosed.mp3:1': sampleBufferH.getChannelData(1),
        'clap.mp3:0': sampleBufferC.getChannelData(0),
        'clap.mp3:1': sampleBufferC.getChannelData(1),
      },
    },
  });

  node.connect(ctx.destination);
})();
</script>

<template>
  <button id="clickMe">Start</button>
  <Tracker />
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}

body {
  background: radial-gradient(#23272e, #111315);
}
</style>
