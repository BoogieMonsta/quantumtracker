<template>
  <div class="title">
    <h1 @click="togglePlay" id="play-btn">
      <span class="accent">Quantum</span>Tracker
    </h1>
    <!-- BPM user input -->
    <!-- <div id="slider-container">
			<label for="bpm" class="bpm-label">{{ bpm }} bpm</label><br />
			<input id="bpm" type="range" min="1" max="200" v-model="bpm" />
		</div> -->
    <!-- code user input (WIP) -->
    <!-- <div class="code-input-container">
      <input id="code-input" type="text" v-if="seqInputIsVisible" placeholder="(3, 11).vol(-4).prob(0.5)">
    </div> -->
  </div>
  <div class="tracker-container">
    <Track
      v-for="col in columns"
      :key="col.id"
      :name="col.name"
      @trigger-sample="triggerSample(col.name)"
      @update-seq="updateSeq($event, col.name)"
    />
  </div>
</template>

<script setup lang="ts">
import Track from './Track.vue';
import { el } from '@elemaudio/core';
import { ref } from 'vue';
import { useKeypress } from 'vue3-keypress';

const columns = [
  { id: 0, name: '#' },
  { id: 1, name: 'Kick' },
  { id: 2, name: 'Snare' },
  { id: 3, name: 'Hihat' },
  { id: 4, name: 'Xtra' },
  { id: 5, name: '#' },
];

const isPlaying = ref(false);
const bpm = ref(88);
const seqInputIsVisible = ref(false);

const playbackRate = el.const({ value: 1 });
const oneShotTrigger = el.const({ value: 1 });

// Convert from BPM to hertz for 1/16 note unit value
// divide by 60 and multiply by 4
let gateHz = bpm.value / 15;
let gate = el.train(gateHz);

function getSamplePath(trackName: string): string {
  let smpPath = '';
  switch (trackName) {
    case 'Kick': {
      smpPath = 'kick.mp3';
      break;
    }
    case 'Snare': {
      smpPath = 'snare.mp3';
      break;
    }
    case 'Hihat': {
      smpPath = 'hhClosed.mp3';
      break;
    }
    case 'Xtra': {
      smpPath = 'clap.mp3';
      break;
    }
  }
  return smpPath;
}

// SAMPLE TRIGGERING (UPON STEP ACTIVATION)
function triggerSample(trackName: string) {
  const samplePath = getSamplePath(trackName);
  const trackLeft = samplePath + ':0';
  const trackRight = samplePath + ':1';

  // FIXME: move core.render() elsewhere
  //   core.render(
  //     el.sample({ path: trackLeft }, oneShotTrigger, playbackRate),
  //     el.sample({ path: trackRight }, oneShotTrigger, playbackRate),
  //   );
}

// SEQUENCING
let kickSeq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let snareSeq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let hihatSeq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let xtraSeq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function togglePlay() {
  isPlaying.value = !isPlaying.value;
  console.log(isPlaying.value ? 'PLAY button pressed' : 'STOP button pressed');
  if (isPlaying.value) {
    playSequence();
  } else {
    const off = el.const({ value: 0 });
    // FIXME: move core.render() elsewhere
    // core.render(off, off);
    console.log('Audio stopped.');
  }
}

function updateSeq(stepSeq: number[], trackName: string) {
  switch (trackName) {
    case 'Kick': {
      kickSeq = stepSeq;
      break;
    }
    case 'Snare': {
      snareSeq = stepSeq;
      break;
    }
    case 'Hihat': {
      hihatSeq = stepSeq;
      break;
    }
    case 'Xtra': {
      xtraSeq = stepSeq;
      break;
    }
  }
}

function playSequence() {
  // computing length in ms from BPM: 4 beats * 60,000 ms / BPM
  let cycleLength = ref((4 * 60000) / bpm.value);

  console.log('Playing audio...');

  setInterval(function () {
    let outL = el.add(
      prepSampleForSeq('kick.mp3:0', kickSeq),
      prepSampleForSeq('snare.mp3:0', snareSeq),
      prepSampleForSeq('hhClosed.mp3:0', hihatSeq),
      prepSampleForSeq('clap.mp3:0', xtraSeq),
    );
    let outR = el.add(
      prepSampleForSeq('kick.mp3:1', kickSeq),
      prepSampleForSeq('snare.mp3:1', snareSeq),
      prepSampleForSeq('hhClosed.mp3:1', hihatSeq),
      prepSampleForSeq('clap.mp3:1', xtraSeq),
    );
    // FIXME: move core.render() elsewhere
    // core.render(outL, outR);
  }, cycleLength.value);
}

function prepSampleForSeq(samplePath: string, sequence: number[]) {
  // we multiply by 1 or 0 to hear or mute the audio
  const onOffSwitch = isPlaying.value
    ? el.const({ value: 1 })
    : el.const({ value: 0 });

  return el.mul(
    el.sample(
      { path: samplePath },
      el.seq({ seq: sequence }, gate, 1),
      playbackRate,
    ),
    onOffSwitch,
  );
}

// KEYPRESS CAPTURE
// TODO: upon keypress, display <input> so user can enter code
// ex: (3, 11, 16).vol(-5).nudge(15).prob(0.5)
// would mean
// - select the kicks at steps 3, 11 and 16
// - make them quieter
// - make them more laid back in the pocket
// - only play them every other cycle
useKeypress({
  keyEvent: 'keydown',
  keyBinds: [
    {
      // ctrl + k
      keyCode: 75,
      modifiers: ['ctrlKey'],
      success: showSeqInput('kick'),
      preventDefault: true,
    },
    {
      // ctrl + s
      keyCode: 83,
      modifiers: ['ctrlKey'],
      success: showSeqInput('snare'),
      preventDefault: true,
    },
    {
      // ctrl + h
      keyCode: 72,
      modifiers: ['ctrlKey'],
      success: showSeqInput('hihat'),
      preventDefault: true,
    },
    {
      // ctrl + x
      keyCode: 88,
      modifiers: ['ctrlKey'],
      success: showSeqInput('xtra'),
      preventDefault: true,
    },
    {
      // space bar
      keyCode: 32,
      success: togglePlay,
      preventDefault: true,
    },
  ],
});

function showSeqInput(trackName: string) {
  // TODO: make an input appear with focus so user can
  // type sequence like 0000100101001000
  // edit sequence with code ([stepNb], [stepNb], ...).somefunction().somefunction()
  seqInputIsVisible.value = true;
}
</script>

<style scoped>
h1 {
  color: #b4b4b4;
  font-size: 2.5em;
  font-family: 'Nunito Sans';
}

.bpm-label {
  font-family: 'Fira Code';
  color: white;
  padding: 10px;
}

.accent {
  background: -webkit-radial-gradient(#7b828c, #50545b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

#play-btn {
  cursor: pointer;
  margin-bottom: 0.3em;
}

#code-input {
  font-family: 'Fira Code', monospace;
  color: white;
  background-color: black;
  padding: 50px;
  width: 80%;
}

.tracker-container {
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
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .'
    '. . . . . .';
}
</style>
