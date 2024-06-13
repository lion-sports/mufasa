<script lang="ts">
	import { AsyncAutocomplete } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	export let values: ComponentProps<AsyncAutocomplete>['values'] = [],
    items: ComponentProps<AsyncAutocomplete>['items'] = [],
		searcher: ComponentProps<AsyncAutocomplete>['searcher'],
		placeholder: string = 'Keep writing ...',
		multiple: boolean = false,
		mobileDrawer: boolean = false,
    disabled: boolean = false
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
