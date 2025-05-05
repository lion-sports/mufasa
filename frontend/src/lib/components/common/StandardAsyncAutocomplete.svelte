<script lang="ts">
	import { AsyncAutocomplete } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		values?: ComponentProps<typeof AsyncAutocomplete>['values']
		items?: ComponentProps<typeof AsyncAutocomplete>['items']
		searcher: ComponentProps<typeof AsyncAutocomplete>['searcher']
		onchange?: ComponentProps<typeof AsyncAutocomplete>['onchange']
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
