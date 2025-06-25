<script lang="ts">
	import { page } from "$app/state"
	import type { LayoutData } from "./$types"
	import ClubHeader from "@/lib/components/clubs/ClubHeader.svelte"
	import { type ComponentProps } from "svelte"
  import StandardTabSwitcher from "@/lib/components/common/StandardTabSwitcher.svelte";
	import { goto } from "$app/navigation"

  let { data, children }: { data: LayoutData, children?: import('svelte').Snippet } = $props()

  let selectedTab: ComponentProps<typeof StandardTabSwitcher>['selected'] = $derived.by(() => {
    let selectedTab = 'general'
    let baseUrl = `/public/clubs/${data.club.name}`
    if(page.url.pathname.startsWith(`${baseUrl}/general`)) selectedTab = 'general'
    else if(page.url.pathname.startsWith(`${baseUrl}/bookings`)) selectedTab = 'bookings'
    return selectedTab
  })

  function handleTabClick(e: { detail: { tab: { name: string | number }}}) {
    if(e.detail.tab.name == 'general') goto((`/public/clubs/${data.club.name}/general`))
    else if(e.detail.tab.name == 'bookings') goto((`/public/clubs/${data.club.name}/bookings`))
  }
</script>

<div class="p-4">
  <ClubHeader
    club={data.club}
    prependVisible={false}
  ></ClubHeader>
</div>

<div class="px-4">
  <StandardTabSwitcher
    tabs={[
      { name: 'general', icon: 'mdi-card-account-details', label: 'Generale'},
      { name: 'bookings', icon: 'mdi-ticket-confirmation', label: 'Prenotazioni' }
    ]}
    selected={selectedTab}
    ontabClick={handleTabClick}
  ></StandardTabSwitcher>
</div>

<div class="px-4">
  {@render children?.()}
</div>