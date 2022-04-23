<template>
  <div class="title">
    <h1 @click="togglePlay" id="play-btn"><span class="accent">Quick</span>Tracker</h1>
    <div id="slider-container">
      <input type="range" min="1" max="200" v-model="tempo">
    </div>
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
import {el} from '@elemaudio/core';
import WebRenderer from '@elemaudio/web-renderer-lite';
import kick from '../assets/samples/kick.mp3';
import snare from '../assets/samples/snare.mp3';
import hhClosed from '../assets/samples/hhClosed.mp3';
import hhOpen from '../assets/samples/hhOpen.mp3';
import clap from '../assets/samples/clap.mp3';
import {ref} from 'vue';
import {useKeypress} from 'vue3-keypress';

// MANAGING SAMPLE FILE PATHS
type Sample =
    | 'Kick'
    | 'Snare'
    | 'HihatC'
    | 'HihatO'
    | 'Xtra';
type Mapping = Record<Sample, string>;
const SAMPLE_PATH: Mapping = {
  Kick: 'kick.mp3',
  Snare: 'snare.mp3',
  HihatC: 'hhClosed.mp3',
  HihatO: 'hhOpen.mp3',
  Xtra: 'clap.mp3',
}

function getSamplePath(trackName: string): string {
  if (trackName === 'Hihat') {
    return SAMPLE_PATH["HihatC"];
  }
  else return SAMPLE_PATH[trackName as Sample];
}

// IMPLEMENTING KEYPRESS CAPTURE
useKeypress({
  keyEvent: "keydown",
  keyBinds: [
    {
      keyCode: 75, // code for 'k'
      modifiers: ['ctrlKey'],
      success: captureKickSeq,
      preventDefault: true,
    },
    {
      keyCode: 83, // code for 's'
      modifiers: ['ctrlKey'],
      success: captureSnareSeq,
      preventDefault: true,
    },
    {
      keyCode: 72, // code for 'h'
      modifiers: ['ctrlKey'],
      success: captureHihatSeq,
      preventDefault: true,
    },
    {
      keyCode: 88, // code for 'x'
      modifiers: ['ctrlKey'],
      success: captureXtraSeq,
      preventDefault: true,
    },
    {
      keyCode: 32, // code for 'space bar'
      success: togglePlay,
      preventDefault: true,
    },
  ],
});

function captureKickSeq() {
  console.log('ready for kick sequence');
  // TODO: make an input appear with focus so user can type sequence in 1 & 0
  // showSequencerInput()
}

function captureSnareSeq() {
  console.log('ready for snare sequence');
  // TODO: make an input appear with focus so user can type sequence in 1 & 0
  // showSequencerInput()
}

function captureHihatSeq() {
  console.log('ready for hihat sequence');
  // TODO: make an input appear with focus so user can type sequence in 1 & 0
  // showSequencerInput()
}

function captureXtraSeq() {
  console.log('ready for xtra sequence');
  // TODO: make an input appear with focus so user can type sequence in 1 & 0
  // showSequencerInput()
}

// SAMPLE TRIGGERING (UPON STEP ACTIVATION)
function triggerSample(trackName: string) {

  const ctx = new window.AudioContext();
  const core = new WebRenderer();

  if (trackName !== '#') {
    const samplePath = getSamplePath(trackName);
    const trackLeft = samplePath + ":0";
    const trackRight = samplePath + ":1";
    // After we've imported and set up our context, we install a load event listener
    // so that once the audio backend is ready we can kick off our render
    core.on('load', async function () {

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      core.render(
          // args in sample(): path, trigger (1 = one shot), playback rate
          el.sample({path: trackLeft}, 1, 1),
          el.sample({path: trackRight}, 1, 1),
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

// SEQUENCING
const isPlaying = ref(false);
const tempo = ref(88);

function togglePlay() {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    playSequence();
  } else {
    stopSequence();
  }
}

function playSequence() {
  console.log('playing sequence!');
  console.log('Tempo: ', tempo.value);

  // Convert from Beats Per Minute to hertz for 1/16 note unit value
  // divide by 60 and multiply by 4
  let gateHz = tempo.value / 15;
  let gate = el.train(gateHz);

  const ctx = new window.AudioContext();
  const core = new WebRenderer();

  core.on('load', async function () {

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    let out = el.add(
        // KICK - left channel
        el.mul(0.5,
            el.sample(
                {path: 'kick.mp3:0'},
                el.seq(
                    {seq: [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1]},
                    gate,
                    1),
                1),
        ),
        // KICK - right channel
        el.mul(0.5,
            el.sample(
                {path: 'kick.mp3:1'},
                el.seq(
                    {seq: [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1]},
                    gate,
                    1),
                1),
        ),
        // SNARE - left channel
        el.mul(0.5,
            el.sample(
                {path: 'snare.mp3:0'},
                el.seq(
                    {seq: [0, 0, 0, 0, 1, 0, 0, 0]},
                    gate,
                    1),
                1),
        ),
        // SNARE - right channel
        el.mul(0.5,
            el.sample(
                {path: 'snare.mp3:1'},
                el.seq(
                    {seq: [0, 0, 0, 0, 1, 0, 0, 0]},
                    gate,
                    1),
                1),
        ),
        // HH CLOSED - left channel
        el.mul(0.04,
            el.sample(
                {path: 'hhClosed.mp3:0'},
                el.seq(
                    {seq: [1]},
                    gate,
                    1),
                1),
        ),
        // HH CLOSED - right channel
        el.mul(0.04,
            el.sample(
                {path: 'hhClosed.mp3:1'},
                el.seq(
                    {seq: [1]},
                    gate,
                    1),
                1),
        ),
        // CLAP - left channel
        el.mul(0.5,
            el.sample(
                {path: 'clap.mp3:0'},
                el.seq(
                    {seq: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0]},
                    gate,
                    1),
                1),
        ),
        // CLAP - right channel
        el.mul(0.5,
            el.sample(
                {path: 'clap.mp3:1'},
                el.seq(
                    {seq: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0]},
                    gate,
                    1),
                1),
        ),
    );
    core.render(out, out);
  });

  (async function main() {
    let kickSmp = await fetch(kick);
    let snareSmp = await fetch(snare);
    let hhClosedSmp = await fetch(hhClosed);
    let hhOpenSmp = await fetch(hhOpen);
    let clapSmp = await fetch(clap);
    let sampleBufferK = await ctx.decodeAudioData(await kickSmp.arrayBuffer());
    let sampleBufferS = await ctx.decodeAudioData(await snareSmp.arrayBuffer());
    let sampleBufferHc = await ctx.decodeAudioData(await hhClosedSmp.arrayBuffer());
    let sampleBufferHo = await ctx.decodeAudioData(await hhOpenSmp.arrayBuffer());
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
          'hhClosed.mp3:0': sampleBufferHc.getChannelData(0),
          'hhClosed.mp3:1': sampleBufferHc.getChannelData(1),
          'hhOpen.mp3:0': sampleBufferHo.getChannelData(0),
          'hhOpen.mp3:1': sampleBufferHo.getChannelData(1),
          'clap.mp3:0': sampleBufferC.getChannelData(0),
          'clap.mp3:1': sampleBufferC.getChannelData(1),
        }
      }
    });

    node.connect(ctx.destination);
  })();
}

function stopSequence() {
  console.log('stopped sequence.');
  console.log('Tempo: ', tempo.value);

}

// COLUMNS FOR DISPLAY
const columns = [
  {id: 0, name: "#"},
  {id: 1, name: "Kick"},
  {id: 2, name: "Snare"},
  {id: 3, name: "Hihat"},
  {id: 4, name: "Xtra"},
  {id: 5, name: "#"}
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

#play-btn {
  cursor: pointer;
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