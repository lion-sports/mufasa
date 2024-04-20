<script lang="ts">
	import type { Teammate } from '$lib/services/teams/teams.service'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import { Icon } from '@likable-hair/svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import GroupMultipleSelectorChip from '$lib/components/groups/GroupMultipleSelectorChip.svelte'
	import type { Group } from '$lib/services/groups/groups.service'
	import type { ComponentProps } from 'svelte'

	export let teammates: Teammate[] = [],
		team: { id: number } | undefined = undefined,
		searchable: boolean = false,
		onlyConvocables: boolean = false,
		groupFilter: boolean = false,
		selectableGroups: Group[] = [],
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
			(!onlyConvocables || (!!onlyConvocables && (!teammate.group || teammate.group.convocable))) &&
			(!selectedGroups ||
				selectedGroups.length == 0 ||
				(selectedGroups.length > 0 &&
					teammate.groupId &&
					selectedGroups.map((r) => r.value).includes(teammate.groupId?.toString())))
		)
	})

	function handleChange(teammate: Teammate, event: any) {
		value[teammate.id] = event.target.checked
	}

	let selectedGroups: ComponentProps<GroupMultipleSelectorChip>['value'] = []
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

{#if groupFilter && !!team}
	<GroupMultipleSelectorChip
		onlyConvocable={true}
		bind:groups={selectableGroups}
		bind:value={selectedGroups}
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
						>{teammate.group?.name || ''}</span
					>
				</svelte:fragment>
			</LabelAndCheckbox>
		</div>
	{/each}
</div>
