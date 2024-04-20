<script lang="ts">
	import user from '$lib/stores/auth/user'
	import { page } from '$app/stores'
	import type { ComponentProps } from 'svelte'
	import { goto } from '$app/navigation'
	import team from '$lib/stores/teams/teamsShow'
	import teamCans from '$lib/stores/teams/teamsCans'
	import CansService from '$lib/services/groups/cans.service'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import StandardTabSwitcher from '$lib/components/common/StandardTabSwitcher.svelte'
	import OptionMenu from '$lib/components/common/OptionMenu.svelte'
	import { CircularLoader } from '@likable-hair/svelte'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'
	import InvitationsService from '$lib/services/invitations/invitations.service'
	import type { LayoutData } from './$types'
	import { slide } from 'svelte/transition'

	export let data: LayoutData
	$team = data.team

	let currentTeammates = $team.teammates.find((teammate) => {
		return !!$user && teammate.userId == $user?.id
	})

	$teamCans = {
		cans: currentTeammates?.group?.cans,
		owner: !!$user && $team.ownerId == $user?.id
	}

	let selectedTab: string = 'general',
		options: ComponentProps<OptionMenu>['options'] = [],
		tabs: ComponentProps<StandardTabSwitcher>['tabs'] = []

	options = []

	if (CansService.can('Team', 'update'))
		options.push({
			name: 'edit',
			title: 'Modifica',
			icon: 'mdi-pencil'
		})

	if (CansService.can('Team', 'invite'))
		options.push({
			name: 'inviteUser',
			title: 'Invita utente',
			icon: 'mdi-account-plus'
		})

	if (CansService.can('Event', 'create'))
		options.push({
			name: 'addEvent',
			title: 'Aggiungi evento',
			icon: 'mdi-calendar-plus'
		})

	if (CansService.can('Team', 'destroy'))
		options.push({
			name: 'delete',
			title: 'Elimina',
			icon: 'mdi-delete',
			style: {
				color: 'rgb(var(--global-color-error-500))'
			}
		})

	if (!$teamCans.owner)
		options.push({
			name: 'exit',
			title: 'Esci dal team',
			icon: 'mdi-delete',
			style: {
				color: 'rgb(var(--global-color-error-500))'
			}
		})

	tabs = [
		{
			name: 'general',
			label: 'Generale'
		},
		{
			name: 'teammates',
			label: 'Partecipanti'
		}
	]

	if (CansService.can('Group', 'update'))
		tabs.push({
			name: 'groups',
			label: 'Gruppi'
		})

	tabs.push({
		name: 'calendar',
		label: 'Calendario'
	})

	tabs.push({
		name: 'weeks',
		label: 'Settimane'
	})

	function handleOptionClick(
		event: CustomEvent<{ element: NonNullable<ComponentProps<OptionMenu>['options']>[0] }>
	) {
		console.log(event.detail)
		if (event.detail?.element?.name == 'edit' && !!$team) {
			goto('/teams/' + $team.id + '/edit')
		} else if (event.detail?.element?.name == 'inviteUser' && !!$team) {
			goto('/teams/' + $team.id + '/inviteUser')
		} else if (event.detail?.element?.name == 'addEvent' && !!$team) {
			goto('/teams/' + $team.id + '/events/new')
		} else if (event.detail?.element?.name == 'exit') {
			exitTeamConfirmDialog = true
		}
	}

	function handleTabClick(event: any) {
		if (selectedTab == 'general') {
			goto(`/teams/${$team?.id}/general`, { replaceState: true })
		} else if (selectedTab == 'teammates') {
			goto(`/teams/${$team?.id}/teammates`, { replaceState: true })
		} else if (selectedTab == 'groups') {
			goto(`/teams/${$team?.id}/groups`, { replaceState: true })
		} else if (selectedTab == 'calendar') {
			goto(`/teams/${$team?.id}/calendar`, { replaceState: true })
		} else if (selectedTab == 'weeks') {
			goto(`/teams/${$team?.id}/weeks`, { replaceState: true })
		}
	}

	$: if ($page.url.href.endsWith('general')) {
		selectedTab = 'general'
	} else if (
		$page.url.href.endsWith('teammates') ||
		$page.url.href.endsWith('inviteUser') ||
		$page.url.href.includes('teammates')
	) {
		selectedTab = 'teammates'
	} else if ($page.url.href.endsWith('groups')) {
		selectedTab = 'groups'
	} else if ($page.url.href.endsWith('calendar')) {
		selectedTab = 'calendar'
	} else if ($page.url.href.endsWith('weeks')) {
		selectedTab = 'weeks'
	}

	let exitTeamConfirmDialog: boolean = false

	function confirmTeamExit() {
		let service = new InvitationsService({ fetch })
		if (!!$team) {
			service
				.exit({
					team: $team
				})
				.then(() => {
					goto('/teams')
				})
		}
	}

	$: headerHidden =
		$page.url.pathname.endsWith('/groups/new') ||
		/\/groups\/\d+\/edit$/.test($page.url.pathname) ||
		$page.url.pathname.endsWith('/events/new') ||
		/\/events\/\d+\//.test($page.url.pathname)
</script>

{#if !!$team}
	{#if !headerHidden}
		<div transition:slide|local={{ duration: 200 }}>
			<PageTitle title={$team.name} prependVisible={true}>
				<svelte:fragment slot="append">
					{#if !!options && options.length > 0}
						<OptionMenu {options} on:select={handleOptionClick} />
					{/if}
				</svelte:fragment>
			</PageTitle>

			<StandardTabSwitcher
				{tabs}
				marginTop="10px"
				marginBottom="10px"
				bind:selected={selectedTab}
				on:tab-click={handleTabClick}
			/>
		</div>
	{/if}

	<slot />
{:else}
	<CircularLoader />
{/if}

<ConfirmDialog
	confirmText="Esci"
	cancelText="Annulla"
	title="Esci dal team"
	description={`Sei sicuro di voler uscire dal team ${$team?.name}?`}
	bind:open={exitTeamConfirmDialog}
	on:cancel-click={() => (exitTeamConfirmDialog = false)}
	on:confirm-click={confirmTeamExit}
/>
