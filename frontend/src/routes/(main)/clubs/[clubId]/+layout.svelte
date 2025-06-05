<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
  import type { LayoutData } from './$types';
	import MediaImage from '@/lib/components/media/MediaImage.svelte'
	import ClubsMediaService from '@/lib/services/media/clubsMedia.service'
	import PageTitle from '@/lib/components/common/PageTitle.svelte'
	import StandardTabSwitcher from '@/lib/components/common/StandardTabSwitcher.svelte'
	import type { ComponentProps } from 'svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { SPORT_ICON } from '@/lib/services/sport'

  let { data, children }: { 
    data: LayoutData,
    children?: import('svelte').Snippet
  } = $props();

  async function fetchBlob({
    mediaId, 
    thumbnail
  }: {
    mediaId: number,
    thumbnail: boolean
  }) {
    let mediaService = new ClubsMediaService({ fetch })
    if(thumbnail) {
      return await mediaService.getThumbnailBlob({ mediaId })
    } else {
      return await mediaService.getBlob({ mediaId })
    }
  }

  let tabs: ComponentProps<typeof StandardTabSwitcher>['tabs'] = [
      { name: 'general', icon: 'mdi-card-account-details', label: 'Generale'},
      { name: 'members', icon: 'mdi-account-multiple', label: 'Membri'},
      { name: 'teams', icon: SPORT_ICON[data.club.sport || 'none'], label: 'Teams'},
      { name: 'invitations', icon: 'mdi-email', label: 'Inviti'},
      { name: 'settings', icon: 'mdi-cog', label: 'Impostazioni'}
    ],
    selectedTab: ComponentProps<typeof StandardTabSwitcher>['selected'] = $derived.by(() => {
      let selectedTab = 'general'
      let baseUrl = `/clubs/${data.club.id}`
      if(page.url.pathname.startsWith(`${baseUrl}/general`)) selectedTab = 'general'
      else if(page.url.pathname.startsWith(`${baseUrl}/members`)) selectedTab = 'members'
      else if(page.url.pathname.startsWith(`${baseUrl}/settings`)) selectedTab = 'settings'
      else if(page.url.pathname.startsWith(`${baseUrl}/teams`)) selectedTab = 'teams'
      else if(page.url.pathname.startsWith(`${baseUrl}/invitations`)) selectedTab = 'invitations'
      return selectedTab
    })

  function handleTabClick(e: { detail: { tab: { name: string | number }}}) {
    if(e.detail.tab.name == 'general') goto((`/clubs/${data.club.id}/general`))
    else if(e.detail.tab.name == 'members') goto((`/clubs/${data.club.id}/members`))
    else if(e.detail.tab.name == 'settings') goto((`/clubs/${data.club.id}/settings`))
    else if(e.detail.tab.name == 'teams') goto((`/clubs/${data.club.id}/teams`))
    else if(e.detail.tab.name == 'invitations') goto((`/clubs/${data.club.id}/invitations`))
  }

</script>

<div class="rounded h-[40vh] header-image bg-[rgb(var(--global-color-background-300))] flex justify-center items-center overflow-hidden">
  {#if !!data.club.headerMediaId}
    <MediaImage
      mediaId={data.club.headerMediaId}
      --media-image-width="100%"
      --media-image-height="100%"
      {fetchBlob}
    ></MediaImage>
  {/if}
</div>
<div class="mt-[-132px] w-full">
  <div class="flex items-center md:items-start md:justify-start md:pl-12 w-full gap-[24px] md:gap-[64px] flex-col md:flex-row">
    <div class="h-[300px] w-[300px] dark:bg-[rgb(var(--global-color-primary-700))] bg-[rgb(var(--global-color-primary-400))] rounded-full overflow-hidden">
      {#if !!data.club.logoMediaId}
        <MediaImage
          mediaId={data.club.logoMediaId}
          --media-image-width="100%"
          --media-image-height="100%"
          {fetchBlob}
        ></MediaImage>
      {:else}
        <div class="w-full h-full flex justify-center items-center">
          <Icon name="mdi-domain" --icon-size="80px" --icon-color="rgb(var(--global-color-primary-foreground))"></Icon>
        </div>
      {/if}
    </div>
    <div class="md:mt-[148px] flex-grow md:w-auto w-full">
      <PageTitle
        title={data.club.completeName}
        subtitle={"@" + data.club.name}
        prependVisible
        prependRoute="/clubs"
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
      </PageTitle>
    </div>
	</div>
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
</div>