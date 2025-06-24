<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
  import type { LayoutData } from './$types';
	import StandardTabSwitcher from '@/lib/components/common/StandardTabSwitcher.svelte'
	import type { ComponentProps } from 'svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { SPORT_ICON } from '@/lib/services/sport'
	import ClubHeader from '@/lib/components/clubs/ClubHeader.svelte'

  let { data, children }: { 
    data: LayoutData,
    children?: import('svelte').Snippet
  } = $props();

  let tabs: ComponentProps<typeof StandardTabSwitcher>['tabs'] = $derived.by(() => {
    let tabs: ComponentProps<typeof StandardTabSwitcher>['tabs'] = [
      { name: 'general', icon: 'mdi-card-account-details', label: 'Generale'},
      { name: 'members', icon: 'mdi-account-multiple', label: 'Membri'},
      { name: 'teams', icon: SPORT_ICON[data.club.sport || 'none'], label: 'Teams'},
      { name: 'invitations', icon: 'mdi-email', label: 'Inviti'},
      { name: 'places', icon: 'mdi-map-marker', label: 'Campi e palestre'},
    ]

    if(data.club.setting?.settings.bookingsActive) {
      tabs.push({ name: 'bookings', icon: 'mdi-ticket-confirmation', label: 'Prenotazioni' })
    }

    tabs.push({ name: 'settings', icon: 'mdi-cog', label: 'Impostazioni'})
    return tabs
  }),
    selectedTab: ComponentProps<typeof StandardTabSwitcher>['selected'] = $derived.by(() => {
      let selectedTab = 'general'
      let baseUrl = `/clubs/${data.club.id}`
      if(page.url.pathname.startsWith(`${baseUrl}/general`)) selectedTab = 'general'
      else if(page.url.pathname.startsWith(`${baseUrl}/members`)) selectedTab = 'members'
      else if(page.url.pathname.startsWith(`${baseUrl}/settings`)) selectedTab = 'settings'
      else if(page.url.pathname.startsWith(`${baseUrl}/teams`)) selectedTab = 'teams'
      else if(page.url.pathname.startsWith(`${baseUrl}/bookings`)) selectedTab = 'bookings'
      else if(page.url.pathname.startsWith(`${baseUrl}/invitations`)) selectedTab = 'invitations'
      else if(page.url.pathname.startsWith(`${baseUrl}/places`)) selectedTab = 'places'
      return selectedTab
    })

  function handleTabClick(e: { detail: { tab: { name: string | number }}}) {
    if(e.detail.tab.name == 'general') goto((`/clubs/${data.club.id}/general`))
    else if(e.detail.tab.name == 'members') goto((`/clubs/${data.club.id}/members`))
    else if(e.detail.tab.name == 'settings') goto((`/clubs/${data.club.id}/settings`))
    else if(e.detail.tab.name == 'teams') goto((`/clubs/${data.club.id}/teams`))
    else if(e.detail.tab.name == 'bookings') goto((`/clubs/${data.club.id}/bookings`))
    else if(e.detail.tab.name == 'invitations') goto((`/clubs/${data.club.id}/invitations`))
    else if(e.detail.tab.name == 'places') goto((`/clubs/${data.club.id}/places`))
  }

  let headerHidden = $derived(
		page.url.pathname.endsWith('/places/create') ||
		/\/places\/\d+\/edit$/.test(page.url.pathname) ||
    page.url.pathname.endsWith('/bookings/new') ||
    /\/bookings\/\d+\/edit$/.test(page.url.pathname)
	)

</script>

{#if headerHidden}
  <div class="mt-2">
    {@render children?.()}
  </div>
{:else}
  <ClubHeader
    club={data.club}
  >
    {#snippet append()}
      <div class="flex mr-4">
        {#if data.groupedPermissions.club.update}
          <a href={`/clubs/${data.club.id}/edit`}>
            <Icon name="mdi-pencil"></Icon>
          </a>
        {/if}
      </div>
    {/snippet}
  </ClubHeader>
  <div class="mt-2">
    <StandardTabSwitcher
      {tabs}
      selected={selectedTab || 'general'}
      ontabClick={handleTabClick}
    ></StandardTabSwitcher>
  </div>
  <div class="mt-2">
    {@render children?.()}
  </div>
{/if}