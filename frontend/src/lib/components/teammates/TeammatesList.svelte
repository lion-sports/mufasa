<script lang="ts" context="module">
	import type { Teammate, Team } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import { createEventDispatcher, type ComponentProps } from 'svelte'
	import InvitationsService from '$lib/services/invitations/invitations.service'
	import CansService from '$lib/services/roles/cans.service'
	import { SimpleTable, Icon } from '@likable-hair/svelte'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'

	let dispatch = createEventDispatcher<{
		destroy: {}
	}>()

	export let teammates: Teammate[] = [],
		team: Pick<Team, 'id' | 'ownerId'>,
		searchable: boolean = false

	let headers: ComponentProps<SimpleTable>['headers'] = [
		{
			value: 'name',
			label: 'Nome',
			type: {
				key: 'custom'
			}
		},
		{
			value: 'email',
			label: 'Email',
			type: {
				key: 'custom'
			}
		},
		{
			value: 'role',
			label: 'Ruolo',
			type: {
				key: 'custom'
			}
		}
	]

	let searchText: string
	$: filteredTeammates = !!searchText
		? teammates.filter((teammate) => {
				return (
					teammate.user.firstname.toLowerCase() + teammate.user.lastname.toLowerCase()
				).includes(searchText.toLowerCase())
		  })
		: teammates

	function inviteUser(event: any) {
		goto('/teams/' + team.id + '/inviteUser')
	}

	let confirmDialogOpen: boolean, deletingTeammate: Teammate | undefined
	function handleDeleteClick(teammate: any) {
		deletingTeammate = teammate
		confirmDialogOpen = true
	}

	function handleEditClick(teammate: any) {
		goto('/teams/' + team.id + '/teammates/' + teammate.id + '/edit')
	}

	function confirmTeammateDeletion() {
		confirmDialogOpen = false

		if (!!deletingTeammate) {
			let service = new InvitationsService({ fetch })
			service
				.removeUser({
					team: team,
					user: {
						id: deletingTeammate.userId
					}
				})
				.then(() => {
					dispatch('destroy')
				})
		}
	}
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
		<div style:flex-grow="1" />
		{#if CansService.can('Team', 'invite')}
			<div style:margin-left="10px">
				<StandardButton on:click={inviteUser}>Invita</StandardButton>
			</div>
		{/if}
	</div>
{/if}

<div class="overflow-auto w-full mt-4">
	<SimpleTable {headers} items={filteredTeammates}>
		<svelte:fragment slot="custom" let:item let:header>
			{#if header.value == 'role'}
				{#if !!item.role?.name}
					{item.role?.name}
				{:else if !!team.ownerId && item.user.id == team.ownerId}
					Proprietario
				{:else}
					Nessuno
				{/if}
			{:else if header.value == 'name'}
				{item.alias || `${item.user.firstname} ${item.user.lastname}`}
			{:else if header.value == 'email'}
				{item.user.email}
			{/if}
		</svelte:fragment>
		<div style:display="flex" style:justify-content="end" slot="rowActions" let:item>
			{#if CansService.can('Team', 'update')}
				<span style:margin-right="10px">
					<Icon name="mdi-pencil" click on:click={() => handleEditClick(item)} />
				</span>
			{/if}
			{#if ((!!team.ownerId && item.user.id != team.ownerId) || !team.ownerId) && CansService.can('Team', 'removeUser')}
				<Icon
					name="mdi-delete"
					click
					--icon-color="rgb(var(--global-color-error-500))"
					on:click={() => handleDeleteClick(item)}
				/>
			{/if}
		</div>
	</SimpleTable>
</div>

<ConfirmDialog
	confirmText="Elimina"
	title="Eliminazione ruolo"
	description={`Sei sicuro di voler rimuovere ${deletingTeammate?.user?.firstname} ${deletingTeammate?.user?.lastname}?`}
	bind:open={confirmDialogOpen}
	on:cancel-click={() => (confirmDialogOpen = false)}
	on:confirm-click={confirmTeammateDeletion}
/>
