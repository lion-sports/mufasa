<script lang="ts" generics="Data">
	import { Autocomplete } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'
  
  type AutocompleteProps = ComponentProps<typeof Autocomplete<Data>>

	type Props = {
		width?: string
		maxWidth?: string
		height?: string | undefined
		multiple?: boolean
		placeholder?: string | undefined
		itemLabel?: import('svelte').Snippet<[any]>
	} & AutocompleteProps

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
