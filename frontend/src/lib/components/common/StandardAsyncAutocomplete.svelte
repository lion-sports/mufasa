<script lang="ts">
	import { AsyncAutocomplete } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		values?: ComponentProps<AsyncAutocomplete>['values'];
		items?: ComponentProps<AsyncAutocomplete>['items'];
		searcher: ComponentProps<AsyncAutocomplete>['searcher'];
		placeholder?: string;
		multiple?: boolean;
		mobileDrawer?: boolean;
		disabled?: boolean;
	}

	let {
		values = $bindable([]),
		items = $bindable([]),
		searcher = $bindable(),
		placeholder = $bindable('Keep writing ...'),
		multiple = $bindable(false),
		mobileDrawer = $bindable(false),
		disabled = $bindable(false)
	}: Props = $props();
</script>

<AsyncAutocomplete
	bind:values
  bind:items
	bind:searcher
	bind:mobileDrawer
	bind:multiple
	bind:placeholder
  bind:disabled
	on:change
	--autocomplete-min-height="44px"
/>
