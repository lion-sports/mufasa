<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
	import { HierarchyMenu, MediaQuery } from '@likable-hair/svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

  let { data, children }: { data: LayoutData, children: Snippet } = $props();

  let selectedMenu: string | undefined = $derived.by(() => {
    let selectedMenu = 'general'
    if(page.url.pathname.includes('/settings/general')) selectedMenu = 'general'
    else if(page.url.pathname.includes('/settings/invitations')) selectedMenu = 'invitations'
    else if(page.url.pathname.includes('/settings/groups')) selectedMenu = 'groups'
    return selectedMenu
  })

  function handleOptionClick(e: {
    detail: {
      option: {
        name: string
      }
    }
  }) {
    if(e.detail.option.name == 'general') goto(`/clubs/${data.club.id}/settings/general`)
    else if(e.detail.option.name == 'invitations') goto(`/clubs/${data.club.id}/settings/invitations`)
    else if(e.detail.option.name == 'groups') goto(`/clubs/${data.club.id}/settings/groups`)
  }


</script>


<MediaQuery>
  {#snippet defaultSnippet({ mAndUp })}
    <div class="flex mt-4 gap-4">
      <div class="flex justify-center md:justify-normal md:min-w-[240px]">
        <div class="grow">
          <HierarchyMenu
            options={[
              { name: 'general', label: 'Generali', icon: 'mdi-cog'},
              { name: 'invitations', label: 'Inviti', icon: 'mdi-email'},
              { name: 'groups', label: 'Gruppi e permessi', icon: 'mdi-lock'}
            ]}
            selected={selectedMenu}
            onoptionClick={handleOptionClick}
            iconsOnly={!mAndUp}
            --hierarchy-menu-icon-button-padding={!mAndUp ? '0px 4px' : undefined}
          ></HierarchyMenu>
        </div>
        {#if mAndUp}
          <div class="h-full bg-[rgb(var(--global-color-background-400),.5)] w-[2px] rounded ml-4"></div>
        {/if}
      </div>
      <div class="grow">
        {@render children()}
      </div>
    </div>
  {/snippet}
</MediaQuery>