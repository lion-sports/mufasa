<script lang="ts">
	import { page } from '$app/stores'
	import type { ComponentProps } from 'svelte'
	import { goto } from '$app/navigation'
	import EventService from '$lib/services/events/events.service'
	import event from '$lib/stores/events/eventShow'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import StandardTabSwitcher from '$lib/components/common/StandardTabSwitcher.svelte'
	import OptionMenu from '$lib/components/common/OptionMenu.svelte'
	import { CircularLoader } from '@likable-hair/svelte'
	import type { LayoutData } from './$types'
	import { slide } from 'svelte/transition'

	export let data: LayoutData

	let selectedTab: string = 'general',
		options: ComponentProps<OptionMenu>['options'] = [],
		tabs: ComponentProps<StandardTabSwitcher>['tabs'] = []

	options = []

	if (data.groupedPermissions.event.update)
		options.push({
			name: 'update',
			title: 'Modifica',
			icon: 'mdi-pencil'
		})

	if (data.groupedPermissions.event.destroy)
		options.push({
			name: 'destroy',
			title: 'Elimina',
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
			name: 'convocations',
			label: 'Convocazioni',
      icon: 'mdi-list-status'
		}
	]

  if(data.groupedPermissions.scout.view) {
    tabs = [
      ...tabs,
      {
        name: 'scouts',
        label: 'Scout',
        icon: 'mdi-chart-timeline-variant'
      }
    ]
  }

	function handleOptionClick(ev: any) {
		if (ev.detail?.element?.name == 'update')
			goto(`/teams/${data.event.teamId}/events/${data.event.id}/edit`)
		else if (ev.detail?.element?.name == 'destroy' && !!data.event.id) {
			confirmDialogOpen = true
		}
	}

	let confirmDialogOpen: boolean
	function confirmEventDeletion() {
		confirmDialogOpen = false

		if (!!$event) {
			let service = new EventService({ fetch })
			service
				.destroy({
					id: $event.id
				})
				.then(() => {
					goto(`/teams/${data.event.teamId}/calendar`)
				})
		}
	}

	function handleTabClick() {
		if (selectedTab == 'general') {
			goto(`/teams/${data.event.teamId}/events/${data.event.id}/general`, { replaceState: true })
		} else if (selectedTab == 'convocations') {
			goto(`/teams/${data.event.teamId}/events/${data.event.id}/convocations`, { replaceState: true })
		} else if(selectedTab == 'scouts') {
      goto(`/teams/${data.event.teamId}/events/${data.event.id}/scouts`, { replaceState: true })
    }
	}

	$: if ($page.url.href.endsWith('general')) {
		selectedTab = 'general'
	} else if ($page.url.href.endsWith('convocations')) {
		selectedTab = 'convocations'
	} else if($page.url.href.endsWith('scouts')) {
    selectedTab = 'scouts'
  }

	$: headerHidden = $page.url.pathname.endsWith('/edit') ||
    $page.url.pathname.endsWith('/scouts/create') ||
    /\/scouts\/\d+\/studio$/.test($page.url.pathname)
</script>

{#if !!$event}
	{#if !headerHidden}
		<div transition:slide|local={{ duration: 200 }}>
			<PageTitle
				title={$event.name}
				prependVisible={true}
        prependRoute={`/teams/${data.team.id}/calendar`}
			>
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
	confirmText="Elimina"
	title="Eliminazione evento"
	description={`Sei sicuro di voler eliminare l'evento ${$event?.name}?`}
	bind:open={confirmDialogOpen}
	on:cancel-click={() => (confirmDialogOpen = false)}
	on:confirm-click={confirmEventDeletion}
/>
