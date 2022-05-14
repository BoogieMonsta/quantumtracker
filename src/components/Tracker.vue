<template>
	<div class="title">
		<h1 @click="togglePlay" id="play-btn">
			<span class="accent">Quantum</span>Tracker
		</h1>
		<!-- BPM user input -->
		<div id="slider-container">
			<label for="bpm" class="bpm-label">{{ bpm }} bpm</label><br />
			<input id="bpm" type="range" min="1" max="200" v-model="bpm" />
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

	const playbackRate = el.const({ value: 1 });
	const oneShotTrigger = el.const({ value: 1 });

	// Convert from BPM to hertz for 1/16 note unit value
	// divide by 60 and multiply by 4
	let gateHz = bpm.value / 15;
	let gate = el.train(gateHz);

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
		if (!ctx) {
			ctx = new window.AudioContext();
		}

		if (trackName !== '#') {
			const samplePath = getSamplePath(trackName);
			const trackLeft = samplePath + ':0';
			const trackRight = samplePath + ':1';

			// After we've imported and set up our context, we install a load event listener
			// so that once the audio backend is ready we can kick off our render
			core.on('load', async function () {
				if (ctx?.state === 'suspended') {
					await ctx.resume();
				}

				core.render(
					el.sample({ path: trackLeft }, oneShotTrigger, playbackRate),
					el.sample({ path: trackRight }, oneShotTrigger, playbackRate)
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
				let sampleBufferK = await ctx.decodeAudioData(
					await kickSmp.arrayBuffer()
				);
				let sampleBufferS = await ctx.decodeAudioData(
					await snareSmp.arrayBuffer()
				);
				let sampleBufferH = await ctx.decodeAudioData(
					await hhClosedSmp.arrayBuffer()
				);
				let sampleBufferC = await ctx.decodeAudioData(
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
							'hhClosed.mp3:0': sampleBufferH.getChannelData(0),
							'hhClosed.mp3:1': sampleBufferH.getChannelData(1),
							'clap.mp3:0': sampleBufferC.getChannelData(0),
							'clap.mp3:1': sampleBufferC.getChannelData(1),
						},
					},
				});

				node.connect(ctx.destination);
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
		if (!ctx) {
			ctx = new window.AudioContext();
		}

		if (!isPlaying.value) {
			const off = el.const({ value: 0 });
			core.render(off, off);
		}

		// computing length in ms from BPM: 4 beats * 60,000 ms / BPM
		let cycleLength = ref((4 * 60000) / bpm.value);
		console.log('cycle length: ', cycleLength.value);
		

		core.on('load', function () {
			setInterval(function () {
				let outL = el.add(
					prepSampleForSeq('kick.mp3:0', kickSeq),
					prepSampleForSeq('snare.mp3:0', snareSeq),
					prepSampleForSeq('hhClosed.mp3:0', hihatSeq),
					prepSampleForSeq('clap.mp3:0', xtraSeq)
				);
				let outR = el.add(
					prepSampleForSeq('kick.mp3:1', kickSeq),
					prepSampleForSeq('snare.mp3:1', snareSeq),
					prepSampleForSeq('hhClosed.mp3:1', hihatSeq),
					prepSampleForSeq('clap.mp3:1', xtraSeq)
				);
				core.render(outL, outR);
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

	function prepSampleForSeq(samplePath: string, sequence: number[]) {
		// we multiply by 1 or 0 to hear or mute the audio
		const onOffSwitch = isPlaying.value
			? el.const({ key: 'switch', value: 1 })
			: el.const({ key: 'switch', value: 0 });

		// const message =
		// 	onOffSwitch.props.value === 1 ? 'SWITCH: ON' : 'SWITCH: OFF';
		// console.log(message);

		return el.mul(
			el.sample(
				{ path: samplePath },
				el.seq({ seq: sequence }, gate, 1),
				playbackRate
			),
			onOffSwitch
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
