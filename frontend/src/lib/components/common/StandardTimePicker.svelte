<script lang="ts">
	import StandardTextfield from './StandardTextfield.svelte'

	export let value: string = '',
		name: string;
</script>

<StandardTextfield
	bind:value
	appendInnerIcon="mdi-clock"
	type="time"
	--simple-textfield-width="fit-content"
	on:input
/>
