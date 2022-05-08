<template>
	<div class="track-wrapper">
		<Step
			v-for="step in stepsForDisplay"
			:key="step"
			:track-name="name"
			:step-nb="step"
			@trigger-sample="triggerSample"
			@toggle-step-in-seq="toggleStepInSeq(step - 1)"
		/>
	</div>
</template>

<script setup lang="ts">
	import Step from './Step.vue';

	defineProps({ name: String });

	const emit = defineEmits(['triggerSample', 'updateSeq']);
	const stepsForDisplay = [
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
	];
	let stepSequence = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	function triggerSample() {
		emit('triggerSample');
	}

	function toggleStepInSeq(stepNb: number) {
		const oldValue = stepSequence[stepNb];
		stepSequence[stepNb] = oldValue === 0 ? 1 : 0;
		emit('updateSeq', stepSequence);
	}
</script>

<style scoped>
	.track-wrapper {
		margin: 0 0.5em 0 0.5em;
	}
</style>
