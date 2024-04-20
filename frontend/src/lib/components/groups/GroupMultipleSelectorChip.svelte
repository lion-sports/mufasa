<script lang="ts" context="module">
	import type { Chip } from '$lib/components/common/ChipMultipleSelection.svelte'
	import type { Group } from '$lib/services/groups/groups.service'
</script>

<script lang="ts">
	import ChipMultipleSelection from '$lib/components/common/ChipMultipleSelection.svelte'

	export let value: Chip[],
		onlyConvocable: boolean = false,
		groups: Group[]

	let filteredChips: Chip[]

	$: filteredChips = !!groups
		? groups
				.filter((group) => {
					return !onlyConvocable || (onlyConvocable && group.convocable)
				})
				.map((group): Chip => {
					return {
						value: group.id.toString(),
						label: group.name
					}
				})
		: []
</script>

<ChipMultipleSelection bind:chips={filteredChips} bind:value />
