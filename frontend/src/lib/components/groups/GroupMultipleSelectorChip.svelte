<script lang="ts" module>
	import type { Chip } from '$lib/components/common/ChipMultipleSelection.svelte'
	import type { Group } from '$lib/services/groups/groups.service'
</script>

<script lang="ts">
	import ChipMultipleSelection from '$lib/components/common/ChipMultipleSelection.svelte'

	interface Props {
		value: Chip[]
		onlyConvocable?: boolean
		groups: Group[]
	}

	let { value = $bindable(), onlyConvocable = false, groups = $bindable() }: Props = $props()

	let filteredChips: Chip[] = $derived(
		!!groups
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
	)
</script>

<ChipMultipleSelection bind:chips={filteredChips} bind:value />
