<script lang="ts">
	import type { User } from '$lib/services/auth/auth.service'
	import team from '$lib/stores/teams/teamsShow'
	import UserService from '$lib/services/users/user.service'
	import InvitationsService, {
		type Invitation
	} from '$lib/services/invitations/invitations.service'
	import CansService from '$lib/services/roles/cans.service'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import { Icon, MediaQuery } from '@likable-hair/svelte'
	import UsersList from '$lib/components/users/UsersList.svelte'
	import InvitationList from '$lib/components/invitations/InvitationList.svelte'
	import StandardAutocomplete from '$lib/components/common/StandardAutocomplete.svelte'
	import type { ComponentProps } from 'svelte'
	import type { PageData } from './$types'

	export let data: PageData

	let searchText: string, results: User[]
	async function searchUser() {
		userInvited = false
		let service = new UserService({ fetch })
		results = await service.search({ email: searchText })
	}

	let userInvited: boolean = false
	let selectedRoles: NonNullable<ComponentProps<StandardAutocomplete>['values']>
	function inviteUser(user: any) {
		if (!!$team) {
			let service = new InvitationsService({ fetch })
			service
				.inviteUser({
					team: { id: $team.id },
					user: { email: user.email },
					role:
						!!selectedRoles && !!selectedRoles.length
							? { id: parseInt(selectedRoles[0].value) }
							: undefined
				})
				.then((result) => {
					console.log(result)
					if (!!$team && !!$team.invitations) {
						$team.invitations = [...$team.invitations, result]
					}
					userInvited = true
				})
		}
	}

	function handleInvitationDiscard(event: CustomEvent<{ invitation: Invitation }>) {
		if (!!$team) {
			let service = new InvitationsService({ fetch })
			service
				.discardInvitation({
					invitation: event.detail.invitation
				})
				.then((newInvitation) => {
					if (!!$team)
						$team.invitations = $team.invitations?.filter(
							(el) => el.id != event.detail.invitation.id
						)
				})
		}
	}
</script>

{#if CansService.can('Team', 'invite')}
	<MediaQuery let:mAndDown>
		<div
			style:max-width="100%"
			style:width="700px"
			style:margin-bottom="0px"
			style:display="flex"
			style:flex-direction={mAndDown ? 'column' : 'row'}
		>
			<StandardTextfield bind:value={searchText} placeholder="Email">
				<svelte:fragment slot="prepend-inner">
					<div style:margin-right="10px">
						<Icon name="mdi-email" --icon-color="rgb(var(--global-color-contrast-500), .5)" />
					</div>
				</svelte:fragment>
			</StandardTextfield>
			{#if !!$team}
				<div style:margin-left={mAndDown ? '0px' : '10px'}>
					<StandardAutocomplete
						items={data.team.roles?.map((role) => ({
							value: role.id.toString(),
							label: role.name
						})) || []}
						bind:values={selectedRoles}
						placeholder="Ruolo"
					/>
				</div>
			{/if}
			<div
				style:margin-left={mAndDown ? '0px' : '10px'}
				style:margin-top={mAndDown ? '10px' : '0px'}
			>
				<StandardButton on:click={searchUser}>Cerca</StandardButton>
			</div>
		</div>

		{#if !!results && results.length > 0 && !userInvited}
			<UsersList users={results}>
				<svelte:fragment slot="rowActions" let:item>
					<Icon name="mdi-account-plus" click on:click={() => inviteUser(item)} />
				</svelte:fragment>
			</UsersList>
		{:else if !!results && results.length == 0 && !userInvited}
			<div style:margin-top="20px" style:display="flex" style:justify-content="center">
				<div style:max-width="100%" style:width="400px" style:text-align="center">
					Ops, sembra che la mail digitata non esista.
					<br />
					<button
						style:color="rgb(var(--global-color-primary-500))"
						on:click={() =>
							inviteUser({
								email: searchText
							})}>Vuoi invitare lo stesso la mail?</button
					>
					<br />
					quando l'utente si registrerà con questa mail visualizzerà il tuo invito.
				</div>
			</div>
		{:else if userInvited}
			<div
				style:margin-top="20px"
				style:display="flex"
				style:justify-content="center"
				style:align-items="center"
				style:flex-direction="column"
			>
				<div style:max-width="100%" style:width="400px" style:text-align="center">
					Untente invitato, in attesa della sua conferma
				</div>
				<div style:margin-top="10px">
					<Icon --icon-size="40pt" name="mdi-party-popper" />
				</div>
			</div>
		{/if}
		<div class="font-bold mt-6">Inviti in attesa</div>
		<div style:margin-top="10px">
			<InvitationList invitations={$team?.invitations} on:discard={handleInvitationDiscard} />
		</div>
	</MediaQuery>
{:else}
	Non puoi accedere a questa pagina :(
{/if}
