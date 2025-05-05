<script lang="ts">
	import { run } from 'svelte/legacy'

	import { page } from '$app/stores'
	import type { ComponentProps } from 'svelte'
	import { goto } from '$app/navigation'
	import team from '$lib/stores/teams/teamsShow'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import StandardTabSwitcher from '$lib/components/common/StandardTabSwitcher.svelte'
	import OptionMenu from '$lib/components/common/OptionMenu.svelte'
	import { CircularLoader } from '@likable-hair/svelte'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'
	import InvitationsService from '$lib/services/invitations/invitations.service'
	import type { LayoutData } from './$types'
	import { slide } from 'svelte/transition'

	interface Props {
		data: LayoutData
		children?: import('svelte').Snippet
	}

	let { data, children }: Props = $props()
	run(() => {
		$team = data.team
	})

	let selectedTab: string = $state('general'),
		options: ComponentProps<typeof OptionMenu>['options'] = $state([]),
		tabs: ComponentProps<typeof StandardTabSwitcher>['tabs'] = $state([])

	options = []

	if (data.groupedPermissions.team.update)
		options.push({
			name: 'edit',
			title: 'Modifica',
			icon: 'mdi-pencil'
		})

	if (data.groupedPermissions.team.invite)
		options.push({
			name: 'inviteUser',
			title: 'Invita utente',
			icon: 'mdi-account-plus'
		})

	if (data.groupedPermissions.event.create)
		options.push({
			name: 'addEvent',
			title: 'Aggiungi evento',
			icon: 'mdi-calendar-plus'
		})

	if (data.groupedPermissions.team.destroy)
		options.push({
			name: 'delete',
			title: 'Elimina',
			icon: 'mdi-delete',
			style: {
				color: 'rgb(var(--global-color-error-500))'
			}
		})

	if (!data.isOwner)
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
			label: 'Generale',
			icon: 'mdi-text'
		},
		{
			name: 'teammates',
			label: 'Partecipanti',
			icon: 'mdi-account'
		}
	]

	if (data.groupedPermissions.group.update)
		tabs.push({
			name: 'groups',
			label: 'Gruppi',
			icon: 'mdi-account-multiple'
		})

	tabs.push({
		name: 'calendar',
		label: 'Calendario',
		icon: 'mdi-calendar'
	})

	tabs.push({
		name: 'weeks',
		label: 'Settimane',
		icon: 'mdi-clock'
	})

	function handleOptionClick(event: {
		detail: { element: NonNullable<ComponentProps<typeof OptionMenu>['options']>[0] }
	}) {
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

	function handleTabClick() {
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

	run(() => {
		if ($page.url.href.endsWith('general')) {
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
	})

	let exitTeamConfirmDialog: boolean = $state(false)

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

	let headerHidden = $derived(
		$page.url.pathname.endsWith('/groups/new') ||
			/\/groups\/\d+\/edit$/.test($page.url.pathname) ||
			$page.url.pathname.endsWith('/events/new') ||
			/\/events\/\d+\//.test($page.url.pathname) ||
			/\/teammates\/\d+\/edit$/.test($page.url.pathname) ||
			/\/teammates\/\d+\/shirts.*$/.test($page.url.pathname)
	)
</script>

{#if !!$team}
	{#if !headerHidden}
		<div transition:slide|local={{ duration: 200 }}>
			<PageTitle title={$team.name} prependVisible={true}>
				{#snippet append()}
					{#if !!options && options.length > 0}
						<OptionMenu {options} onselect={handleOptionClick} />
					{/if}
				{/snippet}
			</PageTitle>

			<StandardTabSwitcher
				{tabs}
				marginTop="10px"
				marginBottom="10px"
				bind:selected={selectedTab}
				ontabClick={handleTabClick}
			/>
		</div>
	{/if}

	{@render children?.()}
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
