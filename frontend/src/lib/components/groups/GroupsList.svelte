<script lang="ts" context="module">
	import type { Group } from '$lib/services/groups/groups.service'
	import type { Team } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import GroupsService from '$lib/services/groups/groups.service'
	import { createEventDispatcher, type ComponentProps } from 'svelte'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'
	import { SimpleTable, Icon } from '@likable-hair/svelte'

	let dispatch = createEventDispatcher<{
		destroy: undefined
	}>()

	export let groups: Group[] = [],
		team: Team | undefined = undefined,
		searchable: boolean = false

	let headers: ComponentProps<SimpleTable>['headers'] = [
		{
			value: 'name',
			label: 'Nome',
			type: {
				key: 'string'
			}
		}
	]

	let searchText: string
	$: filteredGroups = !!searchText
		? groups.filter((group) => {
				return group.name.toLowerCase().includes(searchText.toLowerCase())
      })
		: groups

	function goToNewGroup(event: any) {
		if (!!team) {
			goto(`/teams/${team.id}/groups/new`)
		}
	}

	function goToEdit(group: any) {
		if (!!team && !!group.id) {
			goto(`/teams/${team.id}/groups/${group.id}/edit`)
		}
	}

	let confirmDialogOpen: boolean, deletingGroup: Group | undefined
	function handleDeleteClick(group: any) {
		deletingGroup = group
		confirmDialogOpen = true
	}

	function confirmGroupDeletion() {
		confirmDialogOpen = false

		if (!!deletingGroup) {
			let service = new GroupsService({ fetch })
			service
				.destroy({
					id: deletingGroup.id
				})
				.then(() => {
					dispatch('destroy')
				})
		}
	}
</script>

{#if searchable}
	<div style:max-width="100%" style:width="400px" style:margin-bottom="0px" style:display="flex">
		<StandardTextfield bind:value={searchText} placeholder="Cerca ruoli ...">
			<svelte:fragment slot="prepend-inner">
				<div style:margin-right="10px">
					<Icon name="mdi-search-web" --icon-color="rgb(var(--global-color-contrast-500), .5)" />
				</div>
			</svelte:fragment>
		</StandardTextfield>
		<div style:margin-left="10px">
			<StandardButton on:click={goToNewGroup}>Nuovo</StandardButton>
		</div>
	</div>
{/if}

<SimpleTable {headers} items={filteredGroups}>
	<div style:display="flex" style:justify-content="end" slot="rowActions" let:item>
		<div style:margin-right="10px">
			<Icon name="mdi-pencil" click on:click={() => goToEdit(item)} />
		</div>
		<Icon
			name="mdi-delete"
			click
			--icon-color="rgb(var(--global-color-error-500))"
			on:click={() => handleDeleteClick(item)}
		/>
	</div>
</SimpleTable>

<ConfirmDialog
	confirmText="Elimina"
	title="Eliminazione grouppo"
	description={`Sei sicuro di voler eliminare il gruppo ${deletingGroup?.name}?`}
	bind:open={confirmDialogOpen}
	on:cancel-click={() => (confirmDialogOpen = false)}
	on:confirm-click={confirmGroupDeletion}
/>
