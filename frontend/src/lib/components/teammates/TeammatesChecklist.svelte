<script lang="ts">
	import type { Teammate } from '$lib/services/teams/teams.service'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import { Icon } from '@likable-hair/svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import RoleMultipleSelectorChip from '$lib/components/roles/RoleMultipleSelectorChip.svelte'
	import type { Role } from '$lib/services/roles/roles.service'
	import type { ComponentProps } from 'svelte'

	export let teammates: Teammate[] = [],
		team: { id: number } | undefined = undefined,
		searchable: boolean = false,
		onlyConvocables: boolean = false,
		roleFilter: boolean = false,
		selectableRoles: Role[] = [],
		value: {
			[key: number]: boolean
		} = {}

	let searchText: string
	$: filteredTeammates = teammates.filter((teammate) => {
		return (
			(!searchText ||
				(!!searchText &&
					(teammate.alias || teammate.user.firstname + ' ' + teammate.user.lastname)
						.toLowerCase()
						.includes(searchText.toLowerCase()))) &&
			(!onlyConvocables || (!!onlyConvocables && (!teammate.role || teammate.role.convocable))) &&
			(!selectedRoles ||
				selectedRoles.length == 0 ||
				(selectedRoles.length > 0 &&
					teammate.roleId &&
					selectedRoles.map((r) => r.value).includes(teammate.roleId?.toString())))
		)
	})

	function handleChange(teammate: Teammate, event: any) {
		value[teammate.id] = event.target.checked
	}

	let selectedRoles: ComponentProps<RoleMultipleSelectorChip>['value'] = []
</script>

{#if searchable}
	<div style:width="100%" style:margin-bottom="0px" style:display="flex">
		<StandardTextfield bind:value={searchText} placeholder="Cerca partecipanti ...">
			<svelte:fragment slot="prepend-inner">
				<div style:margin-right="10px">
					<Icon name="mdi-search-web" --icon-color="rgb(var(--global-color-contrast-500), .5)" />
				</div>
			</svelte:fragment>
		</StandardTextfield>
	</div>
{/if}

{#if roleFilter && !!team}
	<RoleMultipleSelectorChip
		onlyConvocable={true}
		bind:roles={selectableRoles}
		bind:value={selectedRoles}
	/>
{/if}

<div style:max-width="100%" style:overflow="auto">
	{#each filteredTeammates as teammate}
		<div style:margin-top="10px" style:margin-bottom="10px">
			<LabelAndCheckbox
				id={`check-convocation-${teammate.id}`}
				value={value[teammate.id]}
				label=""
				on:change={(event) => handleChange(teammate, event)}
			>
				<svelte:fragment slot="text">
					<span>{teammate.alias || teammate.user.firstname + ' ' + teammate.user.lastname}</span>
					<span style:margin-left="10px" style:font-weight="200" style:font-size="0.9rem"
						>{teammate.role?.name || ''}</span
					>
				</svelte:fragment>
			</LabelAndCheckbox>
		</div>
	{/each}
</div>
