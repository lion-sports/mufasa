<script lang="ts">
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'
	import type { Group } from '$lib/services/groups/groups.service'
  import ScoutRoleAutocomplete from '$lib/components/scouts/ScoutRoleAutocomplete.svelte';
	import type { Role } from '$lib/services/scouts/scouts.service'

	export let alias: string | undefined,
		group:
			| {
					id: number
					name: string
        }
			| undefined,
		teamGroups: Group[] = [],
    defaultRole: Role | undefined = undefined,
    availableRoles: Role[] = []

	let selectedGroups: NonNullable<ComponentProps<StandardAutocomplete>['values']> = []

	$: selectedGroups = !!group
		? [
				{
					value: group.id.toString(),
					label: group.name
				}
      ]
		: []

	function handleGroupChange() {
		if (selectedGroups.length > 0 && !!selectedGroups[0].label) {
			group = {
				id: parseInt(selectedGroups[0].value),
				name: selectedGroups[0].label
			}
		} else if (selectedGroups.length == 0) {
			group = undefined
		}
	}

	$: selectableGroups = teamGroups.map((group) => {
		return {
			value: group.id.toString(),
			label: group.name
		}
	})

  let selectedDefaultRole: Role[] = []
  $: selectedDefaultRole = !!defaultRole ? [defaultRole] : []
</script>

<div class="flex flex-wrap gap-4">
	<div>
		<LabelAndTextfield label="Alias" name="alias" placeholder="Alias" bind:value={alias} />
	</div>
	<div>
		<div>Gruppo</div>
		<div class="mt-2">
			<StandardAutocomplete
				items={selectableGroups}
				bind:values={selectedGroups}
				on:change={handleGroupChange}
				placeholder="Gruppo"
			/>
		</div>
	</div>
  <div>
    <div>Ruolo di default</div>
    <div class="mt-2">
      <ScoutRoleAutocomplete
        bind:values={selectedDefaultRole}
        on:change={() => {
          defaultRole = !!selectedDefaultRole && selectedDefaultRole.length > 0 ? selectedDefaultRole[0] : undefined
        }}
      ></ScoutRoleAutocomplete>
    </div>
  </div>
  <div>
    <div>Ruoli disponibili</div>
    <div class="mt-2">
      <ScoutRoleAutocomplete
        bind:values={availableRoles}
        multiple
      ></ScoutRoleAutocomplete>
    </div>
  </div>
</div>
