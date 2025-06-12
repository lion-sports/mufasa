<script lang="ts" module>
	import type { Group } from '$lib/services/groups/groups.service'
	import type { Team } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import GroupsService from '$lib/services/groups/groups.service'
	import { type ComponentProps } from 'svelte'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'
	import { SimpleTable, Icon } from '@likable-hair/svelte'

	interface Props {
		groups?: Group[]
		team?: Team | undefined
		searchable?: boolean
    ondestroy?: () => void,
    rowActionsSnippet?: ComponentProps<typeof SimpleTable>['rowActionsSnippet']
	}

	let { groups = [], team = undefined, searchable = false, ondestroy, rowActionsSnippet }: Props = $props()

	let headers: ComponentProps<typeof SimpleTable>['headers'] = [
		{
			value: 'name',
			label: 'Nome',
			type: {
				key: 'string'
			}
		}
	]

	let searchText: string = $state('')
	let filteredGroups = $derived(
		!!searchText
			? groups.filter((group) => {
					return !searchText || group.name.toLowerCase().includes(searchText.toLowerCase())
				})
			: groups
	)

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

	let confirmDialogOpen: boolean = $state(false),
		deletingGroup: Group | undefined = $state()
	function handleDeleteClick(group: any) {
		deletingGroup = group
		confirmDialogOpen = true
	}

	async function confirmGroupDeletion() {
		confirmDialogOpen = false

		if (!!deletingGroup) {
			let service = new GroupsService({ fetch })
			await service.destroy({
        id: deletingGroup.id
      })

			if(!!ondestroy) ondestroy()
		}
	}
</script>

{#if searchable}
	<div style:max-width="100%" style:width="400px" style:margin-bottom="0px" style:display="flex">
		<StandardTextfield bind:value={searchText} placeholder="Cerca gruppi ...">
			{#snippet prependInner()}
				<div style:margin-right="10px">
					<Icon name="mdi-search-web" --icon-color="rgb(var(--global-color-contrast-500), .5)" />
				</div>
			{/snippet}
		</StandardTextfield>
		<div style:margin-left="10px">
			<StandardButton on:click={goToNewGroup}>Nuovo</StandardButton>
		</div>
	</div>
{/if}

{#snippet rowActionsSnippetDefault({ item }: Parameters<NonNullable<ComponentProps<typeof SimpleTable>['rowActionsSnippet']>>[0])}
  <div style:display="flex" style:justify-content="end">
    <div style:margin-right="10px">
      <Icon name="mdi-pencil" onclick={() => goToEdit(item)} />
    </div>
    <Icon
      name="mdi-delete"
      --icon-color="rgb(var(--global-color-error-500))"
      onclick={() => handleDeleteClick(item)}
    />
  </div>
{/snippet}

<SimpleTable 
  {headers} 
  items={filteredGroups}
  rowActionsSnippet={rowActionsSnippet || rowActionsSnippetDefault}
>
</SimpleTable>

<ConfirmDialog
	confirmText="Elimina"
	title="Eliminazione grouppo"
	description={`Sei sicuro di voler eliminare il gruppo ${deletingGroup?.name}?`}
	bind:open={confirmDialogOpen}
	on:cancel-click={() => (confirmDialogOpen = false)}
	on:confirm-click={confirmGroupDeletion}
/>
