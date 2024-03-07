<script lang="ts">
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'
	import type { Role } from '$lib/services/roles/roles.service'

	export let alias: string | undefined,
		role:
			| {
					id: number
					name: string
			  }
			| undefined,
		teamRoles: Role[] = []

	let selectedRoles: NonNullable<ComponentProps<StandardAutocomplete>['values']> = []

	$: selectedRoles = !!role
		? [
				{
					value: role.id.toString(),
					label: role.name
				}
		  ]
		: []

	function handleRoleChange() {
		if (selectedRoles.length > 0 && !!selectedRoles[0].label) {
			role = {
				id: parseInt(selectedRoles[0].value),
				name: selectedRoles[0].label
			}
		} else if (selectedRoles.length == 0) {
			role = undefined
		}
	}

	$: selectableRoles = teamRoles.map((role) => {
		return {
			value: role.id.toString(),
			label: role.name
		}
	})
</script>

<div class="flex gap-4">
	<div>
		<LabelAndTextfield label="Alias" name="alias" placeholder="Alias" bind:value={alias} />
	</div>
	<div>
		<div>Ruolo</div>
		<div class="mt-2">
			<StandardAutocomplete
				items={selectableRoles}
				bind:values={selectedRoles}
				on:change={handleRoleChange}
				placeholder="Ruolo"
			/>
		</div>
	</div>
</div>
