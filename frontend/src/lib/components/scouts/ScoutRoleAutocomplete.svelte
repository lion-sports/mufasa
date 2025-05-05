<script lang="ts">
	import { run } from 'svelte/legacy'

	import { ROLES, type Role } from '$lib/services/scouts/scouts.service'
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'

	interface Props {
		values?: Role[]
		multiple?: boolean
		roles?: Role[]
		height?: ComponentProps<typeof StandardAutocomplete>['height']
		onchange?: ComponentProps<typeof StandardAutocomplete>['onchange']
	}

	let {
		values = $bindable([]),
		multiple = $bindable(false),
		roles = ROLES,
		height = undefined,
		onchange
	}: Props = $props()

	let selectedValues: ComponentProps<typeof StandardAutocomplete>['values'] = $state([])
	run(() => {
		selectedValues = values?.map((r) => ({
			label: r,
			value: r
		}))
	})
</script>

<StandardAutocomplete
	bind:values={selectedValues}
	items={roles.map((v) => ({ value: v, label: v }))}
	{onchange}
	{multiple}
	{height}
></StandardAutocomplete>
