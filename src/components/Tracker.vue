<template>
  <div class="title">
    <h1><span class="accent">Quick</span>Tracker</h1>
  </div>
  <div class="container">
    <Track
        v-for="col in columns"
        :key="col.id"
        :name="col.name"
        @trigger-sample="triggerSample(col.name)"
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
import clap from '../assets/samples/clap.mp3';

type Sample =
  | 'Kick'
  | 'Snare'
  | 'Hihat'
  | 'Xtra';

type Mapping = Record<Sample, string>;

const SAMPLE_PATH: Mapping = {
  Kick: 'kick.mp3',
  Snare: 'snare.mp3',
  Hihat: 'hhClosed.mp3',
  Xtra: 'clap.mp3',
}

function getSamplePath(trackName: string): string {
  return SAMPLE_PATH[trackName as Sample];
}

function triggerSample(trackName: string) {
  const ctx = new window.AudioContext();
  const core = new WebRenderer();

  if (trackName !== '#') {
    const samplePath = getSamplePath(trackName);
    const trackLeft = samplePath + ":0";
    const trackRight = samplePath + ":1";
    // After we've imported and set up our context, we install a load event listener
    // so that once the audio backend is ready we can kick off our render
    core.on('load', async function() {

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      core.render(
          // args in sample(): path, trigger (1 = one shot), playback rate
          el.sample(
              {path: trackLeft},
              1,
              1
          ),
          el.sample(
              {path: trackRight},
              1,
              1
          ),
      );
    });
    // After installing our load event handler, we initialize the core renderer
// which will spin up the audio backend with the web audio context and fire
// our load event above when ready.
    (async function main() {
      let kickSmp = await fetch(kick);
      let snareSmp = await fetch(snare);
      let hhClosedSmp = await fetch(hhClosed);
      let clapSmp = await fetch(clap);
      let sampleBufferK = await ctx.decodeAudioData(await kickSmp.arrayBuffer());
      let sampleBufferS = await ctx.decodeAudioData(await snareSmp.arrayBuffer());
      let sampleBufferH = await ctx.decodeAudioData(await hhClosedSmp.arrayBuffer());
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
          }
        }
      });

      node.connect(ctx.destination);
    })();
  }
}

const columns = [
  { id: 0, name: "#" },
  { id: 1, name: "Kick" },
  { id: 2, name: "Snare" },
  { id: 3, name: "Hihat" },
  { id: 4, name: "Xtra" },
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