<script lang="ts">
	import { run } from 'svelte/legacy';

	import { DateTime } from 'luxon'
	import StandardDatepicker from './StandardDatepicker.svelte'
	import StandardTimePicker from './StandardTimePicker.svelte'

	interface Props {
		value?: Date;
		name: string;
	}

	let { value = $bindable(new Date()), name }: Props = $props();

	let time: string | undefined = $state()

	run(() => {
		if (!!value) time = DateTime.fromJSDate(value).toLocaleString(DateTime.TIME_SIMPLE)
	});

	function handleTimeChange(e: any) {
		if (!value) value = new Date()
		if (!!e.target.value) {
			let hours: string = e.target.value.split(':')[0]
			value.setHours(Number(hours))

			let minutes: string = e.target.value.split(':')[1]
			value.setMinutes(Number(minutes))

			value.setSeconds(0)
			value.setMilliseconds(0)

			time = e.target.value

			value = new Date(value)
		} else {
			time = undefined
		}
	}
</script>

<div class="container">
	<div style:width="100%">
		<StandardDatepicker bind:value />
	</div>
	<div style:width="100%">
		<StandardTimePicker name={name + '-time'} value={time} oninput={handleTimeChange} />
	</div>
</div>

<style>
	.container {
		display: flex;
		width: 100%;
	}
</style>
