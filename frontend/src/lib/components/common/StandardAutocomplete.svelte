<script lang="ts" module>
	export type Item = {
		value: string
		label?: string
		data?: any
	}
</script>

<script lang="ts">
	import { Autocomplete } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props extends ComponentProps<typeof Autocomplete> {
		items: Item[]
		width?: string
		maxWidth?: string
		height?: string | undefined
		multiple?: boolean
		placeholder?: string | undefined
		values: Item[]
		itemLabel?: import('svelte').Snippet<[any]>
	}

	let {
		items,
		width = '100%',
		maxWidth = '100%',
		height = '44px',
		multiple = false,
		placeholder = undefined,
		values = $bindable(),
		itemLabel,
    ...rest
	}: Props = $props()

	const itemLabel_render = $derived(itemLabel)
</script>

<Autocomplete
	bind:values
	{width}
	{maxWidth}
	{multiple}
	{placeholder}
	{items}
	--autocomplete-min-height="44px"
	{height}
	{...rest}
>
	{#snippet itemLabelSnippet({ item })}
		{#if itemLabel_render}{@render itemLabel_render({ item })}{:else}
			<div class="label-container">
				<div>{item.label || ''}</div>
			</div>
		{/if}
	{/snippet}
</Autocomplete>
