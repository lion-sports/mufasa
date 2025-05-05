<script lang="ts" generics="Data">
	import { AsyncAutocomplete } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

  type AutocompleteProps = ComponentProps<typeof AsyncAutocomplete<Data>>

	interface Props {
		values?: AutocompleteProps['values']
		items?: AutocompleteProps['items']
		searcher: AutocompleteProps['searcher']
		onchange?: AutocompleteProps['onchange']
		placeholder?: string
		multiple?: boolean
		mobileDrawer?: boolean
		disabled?: boolean
	}

	let {
		values = $bindable(),
		items = $bindable([]),
		searcher = $bindable(),
		placeholder = $bindable('Keep writing ...'),
		multiple = $bindable(false),
		mobileDrawer = $bindable(false),
		disabled = $bindable(false),
		onchange
	}: Props = $props()
</script>

<AsyncAutocomplete
	{values}
	{multiple}
	{disabled}
	{items}
	{placeholder}
	{mobileDrawer}
	{searcher}
	{onchange}
	--autocomplete-min-height="44px"
/>
