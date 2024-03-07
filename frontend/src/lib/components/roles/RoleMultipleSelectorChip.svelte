<script lang="ts" context="module">
	import type { Chip } from '$lib/components/common/ChipMultipleSelection.svelte'
	import type { Role } from '$lib/services/roles/roles.service'
</script>

<script lang="ts">
	import ChipMultipleSelection from '$lib/components/common/ChipMultipleSelection.svelte'

	export let value: Chip[],
		onlyConvocable: boolean = false,
		roles: Role[]

	let filteredChips: Chip[]

	$: filteredChips = !!roles
		? roles
				.filter((role) => {
					return !onlyConvocable || (onlyConvocable && role.convocable)
				})
				.map((role): Chip => {
					return {
						value: role.id.toString(),
						label: role.name
					}
				})
		: []
</script>

<ChipMultipleSelection bind:chips={filteredChips} bind:value />
