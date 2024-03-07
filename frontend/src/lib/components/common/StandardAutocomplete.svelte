<script lang="ts" context="module">
	export type Item = {
		value: string
		label?: string
		data?: any
	}
</script>

<script lang="ts">
	export let items: Item[],
		width: string = '100%',
		maxWidth: string = '100%',
		multiple: boolean = false,
		placeholder: string | undefined = undefined,
		values: Item[]

	import { Autocomplete } from '@likable-hair/svelte'
</script>

<Autocomplete
	bind:values
	{width}
	{maxWidth}
	{multiple}
	{placeholder}
	height="fit-content"
	{items}
	on:change
/>
