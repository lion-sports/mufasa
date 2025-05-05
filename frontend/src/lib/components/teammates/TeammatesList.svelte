<script lang="ts" module>
	import type { Teammate, Team } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import { createEventDispatcher, type ComponentProps } from 'svelte'
	import InvitationsService from '$lib/services/invitations/invitations.service'
	import { SimpleTable, Icon } from '@likable-hair/svelte'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'

	let dispatch = createEventDispatcher<{
		destroy: undefined
	}>()

	interface Props {
		teammates?: Teammate[];
		team: Pick<Team, 'id' | 'ownerId'>;
		searchable?: boolean;
		canInvite?: boolean;
		canUpdateTeam?: boolean;
		canRemoveTeammate?: boolean;
	}

	let {
		teammates = [],
		team,
		searchable = false,
		canInvite = false,
		canUpdateTeam = false,
		canRemoveTeammate = false
	}: Props = $props();

	let headers: ComponentProps<typeof SimpleTable>['headers'] = [
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
			value: 'group',
			label: 'Gruppo',
			type: {
				key: 'custom'
			}
		}
	]

	let searchText: string = $state('')
	let filteredTeammates = $derived(!!searchText
		? teammates.filter((teammate) => {
				return !searchText || (
					teammate.user.firstname.toLowerCase() + teammate.user.lastname.toLowerCase()
				).includes(searchText.toLowerCase()) || (
          !!teammate.alias && teammate.alias.toLowerCase().includes(searchText.toLowerCase())
        )
      })
		: teammates)

	function inviteUser(event: any) {
		goto('/teams/' + team.id + '/inviteUser')
	}

	let confirmDialogOpen: boolean = $state(false), deletingTeammate: Teammate | undefined = $state()
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
	    {#snippet prependInner()}
					
					<div style:margin-right="10px">
						<Icon name="mdi-search-web" --icon-color="rgb(var(--global-color-contrast-500), .5)" />
					</div>
				
					{/snippet}
		</StandardTextfield>
		<div style:flex-grow="1"></div>
		{#if canInvite}
			<div style:margin-left="10px">
				<StandardButton on:click={inviteUser}>Invita</StandardButton>
			</div>
		{/if}
	</div>
{/if}

<div class="overflow-auto w-full mt-4">
	<SimpleTable {headers} items={filteredTeammates}>
		{#snippet customSnippet({ item, header })}
			
				{#if header.value == 'group'}
					{#if !!item.group?.name}
						{item.group?.name}
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
			
			{/snippet}
		{#snippet rowActionsSnippet({ item })}
				<div style:display="flex" style:justify-content="end"  >
				{#if canUpdateTeam}
					<span style:margin-right="10px">
						<Icon name="mdi-pencil" onclick={() => handleEditClick(item)} />
					</span>
				{/if}
				{#if ((!!team.ownerId && item.user.id != team.ownerId) || !team.ownerId) && canRemoveTeammate}
					<Icon
						name="mdi-delete"
						--icon-color="rgb(var(--global-color-error-500))"
						onclick={() => handleDeleteClick(item)}
					/>
				{/if}
			</div>
			{/snippet}
	</SimpleTable>
</div>

<ConfirmDialog
	confirmText="Elimina"
	title="Eliminazione partecipante"
	description={`Sei sicuro di voler rimuovere ${deletingTeammate?.user?.firstname} ${deletingTeammate?.user?.lastname}?`}
	bind:open={confirmDialogOpen}
	on:cancel-click={() => (confirmDialogOpen = false)}
	on:confirm-click={confirmTeammateDeletion}
/>
