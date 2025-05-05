<script lang="ts">
	import StandardTextfield from './StandardTextfield.svelte'

	interface Props {
		value?: string;
		name: string;
	}

	let { value = $bindable(''), name }: Props = $props();
</script>

<StandardTextfield
	bind:value
	appendInnerIcon="mdi-clock"
	type="time"
	--simple-textfield-width="fit-content"
	on:input
/>
