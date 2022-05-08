<template>
	<div class="title">
		<h1 @click="togglePlay" id="play-btn">
			<span class="accent">Quick</span>Tracker
		</h1>
		<!-- BPM user input -->
		<div id="slider-container">
			<label class="bpm-label">{{ bpm }} bpm</label><br />
			<input type="range" min="1" max="200" v-model="bpm" />
		</div>
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
	import WebRenderer from '@elemaudio/web-renderer-lite';
	import kick from '../assets/samples/kick.mp3';
	import snare from '../assets/samples/snare.mp3';
	import hhClosed from '../assets/samples/hhClosed.mp3';
	import hhOpen from '../assets/samples/hhOpen.mp3';
	import clap from '../assets/samples/clap.mp3';
	import { ref } from 'vue';
	import { useKeypress } from 'vue3-keypress';

	let ctx: AudioContext | undefined;
	let core = new WebRenderer();

	const isPlaying = ref(false);
	const bpm = ref(88);
	const seqInputIsVisible = ref(false);

	// SAMPLE FILE PATHS
	// TODO: refactor this to simplify, useless
	type Sample = 'Kick' | 'Snare' | 'HihatC' | 'HihatO' | 'Xtra';
	type Mapping = Record<Sample, string>;
	const SAMPLE_PATH: Mapping = {
		Kick: 'kick.mp3',
		Snare: 'snare.mp3',
		HihatC: 'hhClosed.mp3',
		HihatO: 'hhOpen.mp3',
		Xtra: 'clap.mp3',
	};

	function getSamplePath(trackName: string): string {
		if (trackName === 'Hihat') {
			return SAMPLE_PATH['HihatC'];
		} else return SAMPLE_PATH[trackName as Sample];
	}

	// SAMPLE TRIGGERING (UPON STEP ACTIVATION)
	function triggerSample(trackName: string) {
		const ctxTrig = new AudioContext();
		const coreTrig = new WebRenderer();

		if (trackName !== '#') {
			const samplePath = getSamplePath(trackName);
			const trackLeft = samplePath + ':0';
			const trackRight = samplePath + ':1';

			// After we've imported and set up our context, we install a load event listener
			// so that once the audio backend is ready we can kick off our render
			coreTrig.on('load', async function () {
				if (ctxTrig.state === 'suspended') {
					await ctxTrig.resume();
				}

				coreTrig.render(
					el.sample(
						{ path: trackLeft },
						el.const({ value: 1 }), // trigger (1 = one-shot)
						1 // playback rate
					),
					el.sample(
						{ path: trackRight },
						el.const({ value: 1 }), // trigger (1 = one-shot)
						1 // playback rate
					)
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
				let sampleBufferK = await ctxTrig.decodeAudioData(
					await kickSmp.arrayBuffer()
				);
				let sampleBufferS = await ctxTrig.decodeAudioData(
					await snareSmp.arrayBuffer()
				);
				let sampleBufferH = await ctxTrig.decodeAudioData(
					await hhClosedSmp.arrayBuffer()
				);
				let sampleBufferC = await ctxTrig.decodeAudioData(
					await clapSmp.arrayBuffer()
				);

				let node = await coreTrig.initialize(ctxTrig, {
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

				node.connect(ctxTrig.destination);
			})();
		}
	}

	// SEQUENCING
	let kickSeq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let snareSeq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let hihatSeq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let xtraSeq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	function togglePlay() {
		isPlaying.value = !isPlaying.value;
		console.log(isPlaying.value ? 'PLAY' : 'STOP');
		togglePlaybackSequence();
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

	function togglePlaybackSequence() {
		// when isPlaying, cycleLength must be 4 * (60000 / tempo.value)
		// when not playing, cycleLength must be 5ms

		if (ctx?.state === 'running') {
			ctx.close();
		}
		ctx = new window.AudioContext();

		core.on('load', function () {
			// computing length in ms from BPM: 4 beats * 60,000 ms / BPM
			let cycleLength = ref((4 * 60000) / bpm.value);

			setInterval(async function () {
				if (ctx?.state === 'suspended') {
					await ctx.resume();
				}

				// Convert from BPM to hertz for 1/16 note unit value
				// divide by 60 and multiply by 4
				let gateHz = bpm.value / 15;
				let gate = el.train(gateHz);

				const onOffSwitch = isPlaying.value ? 1 : 0;

				let out = el.add(
					// KICK - left channel
					el.mul(
						0.5,
						el.sample(
							{ path: 'kick.mp3:0' },
							el.seq({ seq: kickSeq }, gate, 1),
							1
						),
						onOffSwitch // we multiply by 1 or 0 to hear or mute the audio
					),
					// KICK - right channel
					el.mul(
						0.5,
						el.sample(
							{ path: 'kick.mp3:1' },
							el.seq({ seq: kickSeq }, gate, 1),
							1
						),
						onOffSwitch
					),
					// SNARE - left channel
					el.mul(
						0.4,
						el.sample(
							{ path: 'snare.mp3:0' },
							el.seq({ seq: snareSeq }, gate, 1),
							1
						),
						onOffSwitch
					),
					// SNARE - right channel
					el.mul(
						0.4,
						el.sample(
							{ path: 'snare.mp3:1' },
							el.seq({ seq: snareSeq }, gate, 1),
							1
						),
						onOffSwitch
					),
					// HH CLOSED - left channel
					el.mul(
						0.15,
						el.sample(
							{ path: 'hhClosed.mp3:0' },
							el.seq({ seq: hihatSeq }, gate, 1),
							1
						),
						onOffSwitch
					),
					// HH CLOSED - right channel
					el.mul(
						0.15,
						el.sample(
							{ path: 'hhClosed.mp3:1' },
							el.seq({ seq: hihatSeq }, gate, 1),
							1
						),
						onOffSwitch
					),
					// XTRA - left channel
					el.mul(
						0.5,
						el.sample(
							{ path: 'clap.mp3:0' },
							el.seq({ seq: xtraSeq }, gate, 1),
							1
						),
						onOffSwitch
					),
					// XTRA - right channel
					el.mul(
						0.5,
						el.sample(
							{ path: 'clap.mp3:1' },
							el.seq({ seq: xtraSeq }, gate, 1),
							1
						),
						onOffSwitch
					)
				);
				core.render(out, out);
			}, cycleLength.value);
		});

		(async function main() {
			let kickSmp = await fetch(kick);
			let snareSmp = await fetch(snare);
			let hhClosedSmp = await fetch(hhClosed);
			let hhOpenSmp = await fetch(hhOpen);
			let clapSmp = await fetch(clap);
			let sampleBufferK = await ctx.decodeAudioData(
				await kickSmp.arrayBuffer()
			);
			let sampleBufferS = await ctx.decodeAudioData(
				await snareSmp.arrayBuffer()
			);
			let sampleBufferHc = await ctx.decodeAudioData(
				await hhClosedSmp.arrayBuffer()
			);
			let sampleBufferHo = await ctx.decodeAudioData(
				await hhOpenSmp.arrayBuffer()
			);
			let sampleBufferX = await ctx.decodeAudioData(
				await clapSmp.arrayBuffer()
			);

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
						'clap.mp3:0': sampleBufferX.getChannelData(0),
						'clap.mp3:1': sampleBufferX.getChannelData(1),
					},
				},
			});
			node.connect(ctx.destination);
		})();
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

	// COLUMNS FOR DISPLAY
	const columns = [
		{ id: 0, name: '#' },
		{ id: 1, name: 'Kick' },
		{ id: 2, name: 'Snare' },
		{ id: 3, name: 'Hihat' },
		{ id: 4, name: 'Xtra' },
		{ id: 5, name: '#' },
	];
</script>

<style scoped>
	h1 {
		color: whitesmoke;
		font-size: 2.5em;
	}

	.bpm-label {
		color: white;
		padding: 10px;
	}

	.accent {
		color: gray;
	}

	#play-btn {
		cursor: pointer;
		font-family: 'Nunito Sans';
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
