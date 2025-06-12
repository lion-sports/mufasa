<script lang="ts">
	import StandardTextfield from './StandardTextfield.svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		value?: string
		name?: string
		oninput?: ComponentProps<typeof StandardTextfield>['oninput']
	}

	let { value = $bindable(''), name, oninput }: Props = $props()
</script>

<StandardTextfield
	bind:value
	appendInnerIcon="mdi-clock"
	type="time"
	--simple-textfield-width="fit-content"
	{name}
	{oninput}
/>
