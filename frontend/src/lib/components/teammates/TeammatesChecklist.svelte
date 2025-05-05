<script lang="ts">
	import type { Teammate } from '$lib/services/teams/teams.service'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import { Icon } from '@likable-hair/svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import GroupMultipleSelectorChip from '$lib/components/groups/GroupMultipleSelectorChip.svelte'
	import type { Group } from '$lib/services/groups/groups.service'
	import type { ComponentProps } from 'svelte'

	interface Props {
		teammates?: Teammate[];
		team?: { id: number } | undefined;
		searchable?: boolean;
		onlyConvocables?: boolean;
		groupFilter?: boolean;
		selectableGroups?: Group[];
		value?: {
			[key: number]: boolean
		};
	}

	let {
		teammates = $bindable([]),
		team = undefined,
		searchable = false,
		onlyConvocables = false,
		groupFilter = false,
		selectableGroups = $bindable([]),
		value = $bindable({})
	}: Props = $props();

	let searchText: string | undefined = $state()

	function handleChange(teammate: Teammate, event: any) {
		value[teammate.id] = event.target.checked
	}

	let selectedGroups: ComponentProps<typeof GroupMultipleSelectorChip>['value'] = $state([])
	let filteredTeammates = $derived(teammates.filter((teammate) => {
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
	}))
</script>

{#if searchable}
	<div style:width="100%" style:margin-bottom="0px" style:display="flex">
		<StandardTextfield bind:value={searchText} placeholder="Cerca partecipanti ...">
      {#snippet prependInner()}
        <div style:margin-right="10px">
          <Icon name="mdi-search-web" --icon-color="rgb(var(--global-color-contrast-500), .5)" />
        </div>
      {/snippet}
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
				{#snippet text()}
							
						<span>{teammate.alias || teammate.user.firstname + ' ' + teammate.user.lastname}</span>
						<span class="font-thin text-xs ml-2"
							>{teammate.group?.name || ''}</span
						>
					
							{/snippet}
			</LabelAndCheckbox>
		</div>
	{/each}
</div>
